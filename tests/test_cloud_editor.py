# SPDX-License-Identifier: AGPL-3.0-or-later
"""Check hosted editor session and origin gates without external services."""

import http.client
from io import BytesIO
import json
import os
from pathlib import Path
import sys
import threading
import time
import unittest
from urllib.parse import parse_qs, urlparse
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from cloud_editor import CloudHandler, CloudServer, require_config
from case_editor_model import load_case
from vocabulary_editor import model as vocabulary_model


class CloudEditorTests(unittest.TestCase):
    def test_vocabulary_has_separate_branch_and_maintainer_gate(self):
        self.server.config["ONTOLOGY_MAINTAINERS"] = "maintainer"
        self.server.sessions["vocabulary-session"] = {
            "token": "fake", "user": "maintainer", "csrf": "csrf-vocab", "branch": "main", "created": time.time(),
        }
        cookie = {"Cookie": "nac_session=vocabulary-session"}
        headers = {**cookie, "Origin": "https://editor.example.org", "X-Editor-Token": "csrf-vocab", "Content-Type": "application/json"}
        source = (Path(__file__).resolve().parents[1] / "ontology/core.ttl").read_text(encoding="utf-8")

        class FakeStore:
            def __init__(self, *_):
                pass

            def create_branch(self, branch):
                return "main-ref"

            def load_vocabulary(self, branch):
                result = vocabulary_model(source)
                result["expected_ref"] = "main-ref"
                return result

            def preview_vocabulary(self, branch, data):
                return {"changed": True, "changes": ["Bezeichnung geändert"]}

            def save_vocabulary(self, branch, data):
                return {"changed": True, "revision": data["revision"], "expected_ref": "new-ref"}

            def create_vocabulary_pr(self, branch, reason, source):
                return "https://github.com/notariat8/ontology/pull/18"

            def load_case(self, slug, branch):
                result = load_case(slug)
                result["expected_ref"] = "main-ref"
                return result

        with patch("cloud_editor.GitHubStore", FakeStore):
            status, _, body = self.request("GET", "/api/status", headers=cookie)
            self.assertEqual(status, 200)
            self.assertTrue(json.loads(body)["ontology_maintainer"])
            status, _, body = self.request("POST", "/api/start-branch", body='{"purpose":"vocabulary"}', headers=headers)
            self.assertEqual(status, 200)
            self.assertIn("ontology-vocabulary-", json.loads(body)["branch"])
            status, _, body = self.request("GET", "/api/vocabulary", headers=cookie)
            self.assertEqual(status, 200)
            proposed = json.loads(body)
            self.assertEqual(len(proposed["terms"]), 34)
            status, _, _ = self.request("POST", "/api/cases/immobilienkaufvertrag/save", body=json.dumps(load_case("immobilienkaufvertrag")), headers=headers)
            self.assertEqual(status, 400)
            status, _, _ = self.request("POST", "/api/vocabulary/preview", body=json.dumps(proposed), headers=headers)
            self.assertEqual(status, 200)
            status, _, _ = self.request("POST", "/api/vocabulary/save", body=json.dumps(proposed), headers=headers)
            self.assertEqual(status, 200)
            status, _, body = self.request("POST", "/api/vocabulary/review", body=json.dumps({"reason": "Fachliche Änderung der Begriffe", "source": "NaC-Commit abc123"}), headers=headers)
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)["branch"], "main")
        self.server.sessions["vocabulary-session"]["user"] = "other"
        status, _, _ = self.request("POST", "/api/start-branch", body='{"purpose":"vocabulary"}', headers=headers)
        self.assertEqual(status, 403)

    def test_oauth_code_is_not_written_to_request_log(self):
        handler = Mock()
        handler.command = "GET"
        handler.path = "/callback?code=one-time-secret&state=state-value"
        CloudHandler.log_request(handler, 302)
        self.assertNotIn("one-time-secret", str(handler.log_message.call_args))
        self.assertIn("/callback", str(handler.log_message.call_args))

    def test_notary_reviewer_must_be_a_configured_editor(self):
        config = {
            "GITHUB_APP_CLIENT_ID": "example", "GITHUB_APP_CLIENT_SECRET": "example-secret",
            "GITHUB_REPOSITORY": "notariat8/ontology", "PUBLIC_ORIGIN": "https://editor.example.org",
            "EDITOR_USERS": "reviewer", "NOTARY_REVIEWERS": "someone-else",
        }
        with patch.dict(os.environ, config, clear=True):
            with self.assertRaisesRegex(ValueError, "Teilmenge"):
                require_config()
            os.environ["NOTARY_REVIEWERS"] = "reviewer"
            self.assertEqual(require_config()["NOTARY_REVIEWERS"], "reviewer")
            os.environ["ONTOLOGY_MAINTAINERS"] = "someone-else"
            with self.assertRaisesRegex(ValueError, "ONTOLOGY_MAINTAINERS"):
                require_config()
            os.environ["ONTOLOGY_MAINTAINERS"] = "reviewer"
            self.assertEqual(require_config()["ONTOLOGY_MAINTAINERS"], "reviewer")

    def setUp(self):
        self.server = CloudServer(("127.0.0.1", 0), {
            "GITHUB_APP_CLIENT_ID": "example",
            "GITHUB_APP_CLIENT_SECRET": "not-a-real-secret",
            "GITHUB_REPOSITORY": "notariat8/ontology",
            "PUBLIC_ORIGIN": "https://editor.example.org",
            "EDITOR_USERS": "reviewer",
        })
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)

    def request(self, method, path, body=None, headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        connection.request(method, path, body=body, headers=headers or {})
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        connection.close()
        return result

    def test_session_required_and_csrf_blocks_cross_origin_write(self):
        status, _, _ = self.request("GET", "/api/status")
        self.assertEqual(status, 401)
        status, _, _ = self.request("GET", "/api/cases/immobilienkaufvertrag/turtle")
        self.assertEqual(status, 401)
        status, _, _ = self.request("POST", "/api/start-branch", body="{}")
        self.assertEqual(status, 401)
        self.server.sessions["test-session"] = {
            "token": "fake", "user": "reviewer", "csrf": "csrf-test",
            "branch": "main", "created": time.time(),
        }
        cookie = {"Cookie": "nac_session=test-session"}
        status, headers, body = self.request("GET", "/api/status", headers=cookie)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["branch"], "main")
        self.assertEqual(headers["Cache-Control"], "no-store")
        status, _, _ = self.request("POST", "/api/start-branch", body="{}", headers={
            **cookie, "Origin": "https://attacker.example", "X-Editor-Token": "csrf-test",
            "Content-Type": "application/json",
        })
        self.assertEqual(status, 403)

    def test_oauth_callback_requires_browser_bound_state(self):
        status, headers, _ = self.request("GET", "/login")
        self.assertEqual(status, 302)
        state = parse_qs(urlparse(headers["Location"]).query)["state"][0]
        self.assertIn("nac_oauth_state=", headers["Set-Cookie"])
        status, _, _ = self.request("GET", "/callback?state=" + state + "&code=fake")
        self.assertEqual(status, 401)

    def test_hosted_login_edit_preview_save_and_review_flow(self):
        class FakeStore:
            review_calls = []

            def __init__(self, owner, repo, token):
                self.token = token

            def create_branch(self, branch):
                return "ref-main"

            def load_case(self, slug, branch):
                model = load_case(slug)
                model["expected_ref"] = "ref-main"
                return model

            def preview(self, slug, branch, data):
                return {"changed": True, "changes": ["Bezeichnung geändert"], "case": slug}

            def save(self, slug, branch, data):
                return {"changed": True, "revision": data["revision"], "expected_ref": "ref-next"}

            def create_pr(self, slug, branch, reason, source):
                return "https://github.com/notariat8/ontology/pull/123"

            def list_case_reviews(self):
                return [{"number": 42, "case": "immobilienkaufvertrag", "title": "Fachliche Änderung"}]

            def review_detail(self, number):
                return {"number": number, "case": "immobilienkaufvertrag", "title": "Fachliche Änderung", "author": "author", "draft": False, "problem": "", "head_sha": "b" * 40, "changes": ["Bezeichnung geändert"], "body": "Fachlicher Grund", "url": "https://github.com/notariat8/ontology/pull/42"}

            def submit_case_review(self, number, head_sha, event, body, reviewer, notaries, checks):
                self.review_calls.append((number, head_sha, event, body, reviewer, notaries, checks))
                return "https://github.com/notariat8/ontology/pull/42#pullrequestreview-1"

        self.server.config["NOTARY_REVIEWERS"] = "reviewer"
        status, headers, _ = self.request("GET", "/login")
        self.assertEqual(status, 302)
        state = parse_qs(urlparse(headers["Location"]).query)["state"][0]
        with (
            patch("cloud_editor.urlopen", return_value=BytesIO(b'{"access_token":"fake-user-token"}')),
            patch("cloud_editor.github_json", side_effect=lambda url, token: {"login": "reviewer"} if url.endswith("/user") else {"full_name": "notariat8/ontology"}),
            patch("cloud_editor.GitHubStore", FakeStore),
        ):
            status, _, _ = self.request("GET", "/callback?state=" + state + "&code=fake", headers={"Cookie": "nac_oauth_state=" + state})
            self.assertEqual(status, 302)
            sid = next(iter(self.server.sessions))
            cookie = {"Cookie": "nac_session=" + sid}
            status, _, body = self.request("GET", "/api/status", headers=cookie)
            self.assertEqual(status, 200)
            csrf = json.loads(body)["token"]
            post_headers = {**cookie, "Origin": "https://editor.example.org", "X-Editor-Token": csrf, "Content-Type": "application/json"}
            status, _, body = self.request("POST", "/api/start-branch", body="{}", headers=post_headers)
            self.assertEqual(status, 200)
            self.assertTrue(json.loads(body)["branch"].startswith("codex/ontology-editor-reviewer-"))
            status, _, body = self.request("GET", "/api/cases/immobilienkaufvertrag", headers=cookie)
            self.assertEqual(status, 200)
            model = json.loads(body)
            self.assertEqual(model["expected_ref"], "ref-main")
            payload = json.dumps(model)
            status, _, _ = self.request("POST", "/api/cases/immobilienkaufvertrag/preview", body=payload, headers=post_headers)
            self.assertEqual(status, 200)
            status, _, body = self.request("POST", "/api/cases/immobilienkaufvertrag/save", body=payload, headers=post_headers)
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)["expected_ref"], "ref-next")
            review = json.dumps({"reason": "Fachliche Anpassung der Vorlage", "source": "NaC-Commit abc123"})
            status, _, body = self.request("POST", "/api/cases/immobilienkaufvertrag/review", body=review, headers=post_headers)
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)["branch"], "main")
            self.assertEqual(self.server.sessions[sid]["branch"], "main")
            status, _, body = self.request("GET", "/api/reviews", headers=cookie)
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)[0]["number"], 42)
            status, _, body = self.request("GET", "/api/reviews/42", headers=cookie)
            self.assertEqual(status, 200)
            self.assertTrue(json.loads(body)["can_approve"])
            decision = json.dumps({"head_sha": "b" * 40, "event": "APPROVE", "body": "Fachlich ausführlich geprüft", "checks": {"terms": True, "sources": True, "relations": True}})
            status, _, body = self.request("POST", "/api/reviews/42/review", body=decision, headers=post_headers)
            self.assertEqual(status, 200)
            self.assertIn("pullrequestreview", json.loads(body)["url"])
            self.assertEqual(FakeStore.review_calls[0][-2], {"reviewer"})
            self.assertTrue(FakeStore.review_calls[0][-1]["terms"])
            status, _, body = self.request("POST", "/api/logout", body="{}", headers=post_headers)
            self.assertEqual(status, 200)
            self.assertTrue(json.loads(body)["ok"])
            status, _, _ = self.request("GET", "/api/status", headers=cookie)
            self.assertEqual(status, 401)


if __name__ == "__main__":
    unittest.main()
