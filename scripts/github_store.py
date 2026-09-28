# SPDX-License-Identifier: AGPL-3.0-or-later
"""GitHub-backed storage for one shared NaC ontology repository.

Only case Turtle and its generated reading page are committed. Each operation
uses an isolated temporary model root, so concurrent editors never switch a
shared Git checkout or overwrite each other's work in server memory.
"""

from __future__ import annotations

import base64
from contextlib import contextmanager
import json
from pathlib import Path
import re
import shutil
from tempfile import TemporaryDirectory
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from case_editor_model import ROOT, case_path, load_case, prepare_change
from case_editor import preview_change


NAME = re.compile(r"[A-Za-z0-9_.-]+\Z")
BRANCH = re.compile(r"codex/ontology-editor-[A-Za-z0-9_.-]+\Z")


class GitHubError(ValueError):
    def __init__(self, status: int, message: str):
        self.status = status
        super().__init__(message)


class GitHubStore:
    def __init__(self, owner: str, repo: str, token: str):
        if not NAME.fullmatch(owner) or not NAME.fullmatch(repo) or not token:
            raise ValueError("Ungültige Repository-Konfiguration")
        self.base = f"https://api.github.com/repos/{owner}/{repo}"
        self.owner = owner
        self.repo = repo
        self.token = token

    def request(self, method: str, path: str, payload: dict | None = None) -> dict | list:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.token}",
            "X-GitHub-Api-Version": "2026-03-10",
            "User-Agent": "NaC-ontology-editor",
        }
        if body is not None:
            headers["Content-Type"] = "application/json"
        req = Request(self.base + path, data=body, headers=headers, method=method)
        try:
            with urlopen(req, timeout=20) as response:
                return json.load(response)
        except HTTPError as error:
            try:
                message = json.load(error).get("message", "GitHub-Anfrage fehlgeschlagen")
            except (ValueError, OSError):
                message = "GitHub-Anfrage fehlgeschlagen"
            raise GitHubError(error.code, message) from None

    def ref(self, branch: str) -> str:
        if branch != "main" and not BRANCH.fullmatch(branch):
            raise ValueError("Ungültiger Arbeitszweig")
        result = self.request("GET", "/git/ref/heads/" + quote(branch, safe="/"))
        return result["object"]["sha"]

    def read_file(self, path: str, branch: str) -> str:
        result = self.request("GET", "/contents/" + quote(path, safe="/") + "?ref=" + quote(branch, safe=""))
        if result.get("encoding") != "base64":
            raise ValueError("GitHub lieferte keine Datei")
        return base64.b64decode(result["content"]).decode("utf-8")

    def create_branch(self, branch: str) -> str:
        if not BRANCH.fullmatch(branch):
            raise ValueError("Ungültiger Arbeitszweig")
        sha = self.ref("main")
        self.request("POST", "/git/refs", {"ref": "refs/heads/" + branch, "sha": sha})
        return sha

    @contextmanager
    def model_root(self, slug: str, branch: str):
        case_path(slug)  # Enforce the pinned 20-case scope before any remote path.
        source = self.read_file(f"cases/{slug}/ontology.ttl", branch)
        with TemporaryDirectory(prefix="nac-editor-") as location:
            root = Path(location)
            (root / "catalog").mkdir()
            (root / "cases" / slug).mkdir(parents=True)
            for filename in ("nac-baseline.json", "nac-usecases.ttl"):
                shutil.copy2(ROOT / "catalog" / filename, root / "catalog" / filename)
            (root / "cases" / slug / "ontology.ttl").write_text(source, encoding="utf-8")
            yield root

    def load_case(self, slug: str, branch: str) -> dict:
        head = self.ref(branch)
        with self.model_root(slug, branch) as root:
            model = load_case(slug, root)
        model["expected_ref"] = head
        return model

    def preview(self, slug: str, branch: str, data: dict) -> dict:
        if self.ref(branch) != data.get("expected_ref"):
            raise ValueError("Der Arbeitszweig wurde inzwischen geändert. Fall neu laden.")
        with self.model_root(slug, branch) as root:
            return preview_change(slug, data, root)

    def save(self, slug: str, branch: str, data: dict) -> dict:
        if branch == "main":
            raise ValueError("Auf main kann nicht gespeichert werden")
        parent = self.ref(branch)
        if parent != data.get("expected_ref"):
            raise ValueError("Der Arbeitszweig wurde inzwischen geändert. Fall neu laden.")
        with self.model_root(slug, branch) as root:
            ttl, page, changed = prepare_change(slug, data, data.get("revision", ""), root)
        if not changed:
            return {"changed": False, "revision": data["revision"], "expected_ref": parent}
        commit = self.request("GET", "/git/commits/" + parent)
        tree = self.request("POST", "/git/trees", {
            "base_tree": commit["tree"]["sha"],
            "tree": [
                {"path": f"cases/{slug}/ontology.ttl", "mode": "100644", "type": "blob", "content": ttl},
                {"path": f"cases/{slug}/README.md", "mode": "100644", "type": "blob", "content": page},
            ],
        })
        new_commit = self.request("POST", "/git/commits", {
            "message": f"Propose ontology change for {slug}", "tree": tree["sha"], "parents": [parent]
        })
        self.request("PATCH", "/git/refs/heads/" + quote(branch, safe="/"), {"sha": new_commit["sha"], "force": False})
        refreshed = self.load_case(slug, branch)
        return {"changed": True, "revision": refreshed["revision"], "expected_ref": refreshed["expected_ref"]}

    def create_pr(self, slug: str, branch: str, reason: str, source: str) -> str:
        if not BRANCH.fullmatch(branch):
            raise ValueError("Ungültiger Arbeitszweig")
        if not isinstance(reason, str) or not isinstance(source, str) or not 15 <= len(reason.strip()) <= 3000 or not 5 <= len(source.strip()) <= 1000:
            raise ValueError("Fachlicher Grund und Quellenstand fehlen")
        title = f"Fachliche Änderung: {self.load_case(slug, branch)['title']}"
        body = f"## Fachlicher Grund\n\n{reason.strip()}\n\n## Quellenstand\n\n{source.strip()}\n\n## Freigabe\n\nNotarielle Fachprüfung ausstehend.\n"
        result = self.request("POST", "/pulls", {"title": title, "head": branch, "base": "main", "body": body, "draft": True})
        return result["html_url"]
