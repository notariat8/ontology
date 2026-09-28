# SPDX-License-Identifier: AGPL-3.0-or-later
"""Single-instance hosted NaC editor with GitHub App user authentication.

Required environment: GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET,
GITHUB_REPOSITORY (owner/repo), PUBLIC_ORIGIN (https://editor.example.org),
EDITOR_USERS (comma-separated GitHub usernames).
TLS terminates at the trusted hosting proxy. Sessions are kept in memory and
expire after eight hours; a restart signs editors out without losing Git data.
"""

from __future__ import annotations

import argparse
import base64
from datetime import datetime, timezone
import hashlib
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import secrets
import threading
import time
from urllib.error import HTTPError
from urllib.parse import parse_qs, quote, urlencode, urlparse
from urllib.request import Request, urlopen

from rdflib import Graph, Namespace
from rdflib.namespace import SKOS

from case_editor_model import ROOT, slugs
from github_store import GitHubError, GitHubStore


ASSETS = ROOT / "editor"
MAX_REQUEST = 250_000
SESSION_LIFETIME = 8 * 60 * 60
AUTH_LIFETIME = 5 * 60


def require_config() -> dict[str, str]:
    names = ("GITHUB_APP_CLIENT_ID", "GITHUB_APP_CLIENT_SECRET", "GITHUB_REPOSITORY", "PUBLIC_ORIGIN", "EDITOR_USERS")
    config = {name: os.environ.get(name, "") for name in names}
    if any(not value for value in config.values()):
        raise ValueError("GitHub-App-Konfiguration und PUBLIC_ORIGIN fehlen")
    origin = urlparse(config["PUBLIC_ORIGIN"])
    if origin.scheme != "https" or not origin.netloc or origin.path not in ("", "/") or origin.query or origin.fragment or origin.username or origin.password:
        raise ValueError("PUBLIC_ORIGIN muss eine HTTPS-Ursprungsadresse sein")
    owner_repo = config["GITHUB_REPOSITORY"].split("/")
    if len(owner_repo) != 2:
        raise ValueError("GITHUB_REPOSITORY muss owner/repo sein")
    GitHubStore(owner_repo[0], owner_repo[1], "configuration-check")
    if not all(value.strip() for value in config["EDITOR_USERS"].split(",")):
        raise ValueError("EDITOR_USERS muss GitHub-Benutzernamen enthalten")
    return config


def github_json(url: str, token: str) -> dict:
    req = Request(url, headers={
        "Accept": "application/vnd.github+json", "Authorization": "Bearer " + token,
        "User-Agent": "NaC-ontology-editor", "X-GitHub-Api-Version": "2026-03-10",
    })
    with urlopen(req, timeout=20) as response:
        return json.load(response)


class CloudServer(ThreadingHTTPServer):
    def __init__(self, address: tuple[str, int], config: dict[str, str]):
        super().__init__(address, CloudHandler)
        self.config = config
        self.sessions: dict[str, dict] = {}
        self.pending: dict[str, dict] = {}
        self.lock = threading.RLock()
        self.owner, self.repo = config["GITHUB_REPOSITORY"].split("/")


class CloudHandler(BaseHTTPRequestHandler):
    server: CloudServer

    def _send(self, status: int, body: bytes, kind: str, extra: dict[str, str] | None = None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", kind + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload: dict | list) -> None:
        self._send(status, json.dumps(payload, ensure_ascii=False).encode("utf-8"), "application/json")

    def _redirect(self, target: str, cookies: list[str] | None = None) -> None:
        self.send_response(302)
        self.send_header("Location", target)
        self.send_header("Cache-Control", "no-store")
        for cookie in cookies or []:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()

    def _session(self) -> dict:
        jar = SimpleCookie()
        try:
            jar.load(self.headers.get("Cookie", ""))
            sid = jar["nac_session"].value if "nac_session" in jar else ""
        except Exception:
            sid = ""
        with self.server.lock:
            session = self.server.sessions.get(sid)
            if session and time.time() - session["created"] < SESSION_LIFETIME:
                return session
            self.server.sessions.pop(sid, None)
        raise PermissionError("Bitte bei GitHub anmelden")

    def _store(self, session: dict) -> GitHubStore:
        return GitHubStore(self.server.owner, self.server.repo, session["token"])

    def _login(self) -> None:
        state = secrets.token_urlsafe(24)
        verifier = secrets.token_urlsafe(48)
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
        with self.server.lock:
            now = time.time()
            self.server.pending = {key: value for key, value in self.server.pending.items() if now - value["created"] < AUTH_LIFETIME}
            self.server.sessions = {key: value for key, value in self.server.sessions.items() if now - value["created"] < SESSION_LIFETIME}
            if len(self.server.pending) >= 100:
                raise ValueError("Zu viele laufende Anmeldungen. Bitte später erneut versuchen.")
            self.server.pending[state] = {"verifier": verifier, "created": time.time()}
        params = {
            "client_id": self.server.config["GITHUB_APP_CLIENT_ID"],
            "redirect_uri": self.server.config["PUBLIC_ORIGIN"].rstrip("/") + "/callback",
            "state": state, "code_challenge": challenge, "code_challenge_method": "S256",
        }
        self._redirect("https://github.com/login/oauth/authorize?" + urlencode(params), [
            f"nac_oauth_state={state}; Path=/callback; Max-Age={AUTH_LIFETIME}; HttpOnly; Secure; SameSite=Lax"
        ])

    def _callback(self, query: dict[str, list[str]]) -> None:
        state = query.get("state", [""])[0]
        code = query.get("code", [""])[0]
        jar = SimpleCookie()
        jar.load(self.headers.get("Cookie", ""))
        if not state or "nac_oauth_state" not in jar or jar["nac_oauth_state"].value != state:
            raise PermissionError("Anmeldung stimmt nicht mit diesem Browser überein")
        with self.server.lock:
            pending = self.server.pending.pop(state, None)
        if not pending or time.time() - pending["created"] > AUTH_LIFETIME or not code:
            raise PermissionError("Anmeldung abgelaufen. Bitte erneut beginnen.")
        params = {
            "client_id": self.server.config["GITHUB_APP_CLIENT_ID"],
            "client_secret": self.server.config["GITHUB_APP_CLIENT_SECRET"],
            "code": code,
            "redirect_uri": self.server.config["PUBLIC_ORIGIN"].rstrip("/") + "/callback",
            "code_verifier": pending["verifier"],
        }
        req = Request("https://github.com/login/oauth/access_token", data=urlencode(params).encode(), headers={
            "Accept": "application/json", "User-Agent": "NaC-ontology-editor",
        }, method="POST")
        with urlopen(req, timeout=20) as response:
            result = json.load(response)
        token = result.get("access_token")
        if not token:
            raise PermissionError("GitHub-Anmeldung fehlgeschlagen")
        user = github_json("https://api.github.com/user", token)
        allowed = {name.strip().lower() for name in self.server.config["EDITOR_USERS"].split(",")}
        if user["login"].lower() not in allowed:
            raise PermissionError("Dieses GitHub-Konto ist nicht als Editor freigeschaltet")
        # A readable repo and a working user token are required; write permission
        # is enforced again by GitHub when creating branches or commits.
        github_json(f"https://api.github.com/repos/{self.server.owner}/{self.server.repo}", token)
        sid = secrets.token_urlsafe(32)
        with self.server.lock:
            self.server.sessions[sid] = {
                "token": token, "user": user["login"], "csrf": secrets.token_urlsafe(32),
                "branch": "main", "created": time.time(),
            }
        self._redirect("/", [
            f"nac_session={sid}; Path=/; Max-Age={SESSION_LIFETIME}; HttpOnly; Secure; SameSite=Lax",
            "nac_oauth_state=; Path=/callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
        ])

    def _catalog(self) -> list[dict]:
        graph = Graph().parse(ROOT / "catalog/nac-usecases.ttl", format="turtle")
        n8 = Namespace("https://notariat8.github.io/ontology/id/")
        return [{"slug": slug, "title": str(graph.value(n8[f"vorgangsart-{slug}"], SKOS.prefLabel))} for slug in slugs()]

    def do_GET(self) -> None:
        try:
            path = urlparse(self.path)
            if path.path == "/login":
                self._login()
            elif path.path == "/callback":
                self._callback(parse_qs(path.query))
            elif path.path in ("/", "/index.html", "/app.js", "/style.css"):
                filename = "index.html" if path.path == "/" else path.path.lstrip("/")
                kind = {"index.html": "text/html", "app.js": "text/javascript", "style.css": "text/css"}
                self._send(200, (ASSETS / filename).read_bytes(), kind[filename])
            elif path.path == "/api/status":
                session = self._session()
                self._json(200, {"token": session["csrf"], "branch": session["branch"], "user": session["user"]})
            elif path.path == "/api/cases":
                self._session()
                self._json(200, self._catalog())
            elif path.path.startswith("/api/cases/") and path.path.count("/") == 3:
                session = self._session()
                self._json(200, self._store(session).load_case(path.path.rsplit("/", 1)[1], session["branch"]))
            elif path.path.startswith("/api/cases/") and path.path.endswith("/turtle") and path.path.count("/") == 4:
                session = self._session()
                slug = path.path.split("/")[3]
                if slug not in slugs():
                    raise ValueError("Unbekannter Fall")
                self._json(200, {"turtle": self._store(session).read_file(f"cases/{slug}/ontology.ttl", session["branch"])})
            else:
                self._json(404, {"error": "Nicht gefunden"})
        except PermissionError as error:
            self._json(401, {"error": str(error)})
        except GitHubError as error:
            self._json(401 if error.status == 401 else 403 if error.status == 403 else 400, {"error": str(error)})
        except ValueError as error:
            self._json(400, {"error": str(error)})
        except HTTPError:
            self._json(403, {"error": "GitHub-Zugriff auf dieses Repository fehlt"})
        except Exception:
            self._json(500, {"error": "Serverfehler bei der Anfrage"})

    def do_POST(self) -> None:
        try:
            session = self._session()
            if self.headers.get("Origin") != self.server.config["PUBLIC_ORIGIN"].rstrip("/"):
                raise PermissionError("Ungültiger Ursprung")
            if self.headers.get("X-Editor-Token") != session["csrf"]:
                raise PermissionError("Ungültige Sitzung")
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_REQUEST or self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise ValueError("Ungültige Anfragegröße oder Inhaltstyp")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("Ungültige Anfrage")
            store = self._store(session)
            if self.path == "/api/logout":
                with self.server.lock:
                    for sid, candidate in list(self.server.sessions.items()):
                        if candidate is session:
                            self.server.sessions.pop(sid, None)
                            break
                self._json(200, {"ok": True})
            elif self.path == "/api/start-branch":
                if session["branch"] == "main":
                    branch = f"codex/ontology-editor-{session['user']}-{datetime.now(timezone.utc):%Y%m%d%H%M%S}-{secrets.token_hex(3)}"
                    store.create_branch(branch)
                    session["branch"] = branch
                self._json(200, {"branch": session["branch"]})
            elif self.path.startswith("/api/cases/") and self.path.count("/") == 4:
                _, _, _, slug, action = self.path.split("/")
                if action == "preview":
                    self._json(200, store.preview(slug, session["branch"], data))
                elif action == "save":
                    self._json(200, store.save(slug, session["branch"], data))
                elif action == "review":
                    url = store.create_pr(slug, session["branch"], data.get("reason", ""), data.get("source", ""))
                    session["branch"] = "main"
                    self._json(200, {"url": url, "branch": "main"})
                else:
                    self._json(404, {"error": "Nicht gefunden"})
            else:
                self._json(404, {"error": "Nicht gefunden"})
        except PermissionError as error:
            self._json(403, {"error": str(error)})
        except GitHubError as error:
            self._json(401 if error.status == 401 else 403 if error.status == 403 else 400, {"error": str(error)})
        except ValueError as error:
            self._json(400, {"error": str(error)})
        except Exception:
            self._json(500, {"error": "Serverfehler bei der Anfrage"})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8080")))
    args = parser.parse_args()
    config = require_config()
    with CloudServer((args.host, args.port), config) as server:
        print(f"NaC editor listening on port {server.server_port}")
        server.serve_forever()


if __name__ == "__main__":
    main()
