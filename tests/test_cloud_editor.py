# SPDX-License-Identifier: AGPL-3.0-or-later
"""Check hosted editor session and origin gates without external services."""

import http.client
import json
from pathlib import Path
import sys
import threading
import time
import unittest
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from cloud_editor import CloudServer


class CloudEditorTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
