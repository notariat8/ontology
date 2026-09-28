# SPDX-License-Identifier: AGPL-3.0-or-later
"""Check atomic GitHub case updates without making network requests."""

from contextlib import nullcontext
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from case_editor_model import ROOT, load_case
from github_store import GitHubStore


class GitHubStoreTests(unittest.TestCase):
    def test_save_writes_only_case_turtle_and_generated_page(self):
        store = GitHubStore("notariat8", "ontology", "fake-token")
        model = load_case("immobilienkaufvertrag")
        model["nodes"][0]["label"] = "Geänderte Fachbezeichnung"
        model["expected_ref"] = "parent"
        calls = []

        def request(method, path, payload=None):
            calls.append((method, path, payload))
            if method == "GET" and path == "/git/commits/parent":
                return {"tree": {"sha": "old-tree"}}
            if method == "POST" and path == "/git/trees":
                return {"sha": "new-tree"}
            if method == "POST" and path == "/git/commits":
                return {"sha": "new-commit"}
            if method == "PATCH":
                return {}
            raise AssertionError((method, path))

        with (
            patch.object(store, "ref", side_effect=["parent", "new-commit"]),
            patch.object(store, "model_root", side_effect=lambda *_: nullcontext(ROOT)),
            patch.object(store, "request", side_effect=request),
        ):
            result = store.save("immobilienkaufvertrag", "codex/ontology-editor-test", model)
        tree = next(payload for method, path, payload in calls if path == "/git/trees")
        self.assertEqual(tree["base_tree"], "old-tree")
        self.assertEqual({item["path"] for item in tree["tree"]}, {
            "cases/immobilienkaufvertrag/ontology.ttl",
            "cases/immobilienkaufvertrag/README.md",
        })
        self.assertEqual(result["expected_ref"], "new-commit")
        self.assertTrue(result["changed"])

    def test_stale_branch_cannot_save(self):
        store = GitHubStore("notariat8", "ontology", "fake-token")
        model = load_case("immobilienkaufvertrag")
        model["expected_ref"] = "old"
        with patch.object(store, "ref", return_value="new"):
            with self.assertRaisesRegex(ValueError, "inzwischen geändert"):
                store.save("immobilienkaufvertrag", "codex/ontology-editor-test", model)


if __name__ == "__main__":
    unittest.main()
