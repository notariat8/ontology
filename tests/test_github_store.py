# SPDX-License-Identifier: AGPL-3.0-or-later
"""Check atomic GitHub case updates without making network requests."""

from contextlib import nullcontext
import base64
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from case_editor_model import ROOT, load_case, prepare_change
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

    def test_semantic_review_requires_notary_and_current_commit(self):
        slug = "immobilienkaufvertrag"
        model = load_case(slug)
        model["nodes"][0]["label"] = "Fachliche Bezeichnung im Prüfentwurf"
        changed_ttl, page, changed = prepare_change(slug, model, model["revision"])
        self.assertTrue(changed)
        original = (ROOT / "cases" / slug / "ontology.ttl").read_text(encoding="utf-8")
        base, head = "a" * 40, "b" * 40
        pr = {
            "number": 42, "title": "Fachliche Änderung: Immobilienkaufvertrag", "state": "open",
            "base": {"ref": "main", "sha": base}, "head": {"sha": head, "repo": {"full_name": "notariat8/ontology"}},
            "changed_files": 2, "draft": False, "user": {"login": "author"},
            "html_url": "https://github.com/notariat8/ontology/pull/42", "body": "Fachlicher Grund und Quelle", "updated_at": "2026-09-28T00:00:00Z",
        }
        store = GitHubStore("notariat8", "ontology", "fake-token")
        reviewed = []

        def request(method, path, payload=None):
            if (method, path) == ("GET", "/pulls?state=open&base=main&per_page=100"):
                return [{"number": 42}]
            if (method, path) == ("GET", "/pulls/42"):
                return pr
            if (method, path) == ("GET", "/pulls/42/files?per_page=100"):
                return [{"filename": f"cases/{slug}/ontology.ttl"}, {"filename": f"cases/{slug}/README.md"}]
            if (method, path) == ("GET", f"/compare/{base}...{head}"):
                return {"merge_base_commit": {"sha": base}}
            if method == "GET" and path.startswith(f"/contents/cases/{slug}/"):
                file, ref = path.split("?ref=")
                content = original if ref == base else changed_ttl if file.endswith("ontology.ttl") else page
                return {"encoding": "base64", "content": base64.b64encode(content.encode()).decode()}
            if (method, path) == ("POST", "/pulls/42/reviews"):
                reviewed.append(payload)
                return {"html_url": "https://github.com/notariat8/ontology/pull/42#pullrequestreview-1"}
            raise AssertionError((method, path))

        with patch.object(store, "request", side_effect=request):
            self.assertEqual(store.list_case_reviews()[0]["case"], slug)
            detail = store.review_detail(42)
            self.assertEqual(detail["problem"], "")
            self.assertTrue(any("Fachliche Bezeichnung im Prüfentwurf" in item for item in detail["changes"]))
            with self.assertRaisesRegex(PermissionError, "Notarkonten"):
                store.submit_case_review(42, head, "APPROVE", "Fachlich ausführlich geprüft", "reviewer", set())
            with self.assertRaisesRegex(ValueError, "neuen Stand"):
                store.submit_case_review(42, base, "APPROVE", "Fachlich ausführlich geprüft", "notary", {"notary"})
            with self.assertRaisesRegex(ValueError, "nicht selbst"):
                store.submit_case_review(42, head, "APPROVE", "Fachlich ausführlich geprüft", "author", {"author"})
            with self.assertRaisesRegex(ValueError, "als geprüft bestätigt"):
                store.submit_case_review(42, head, "APPROVE", "Fachlich ausführlich geprüft", "notary", {"notary"})
            url = store.submit_case_review(42, head, "APPROVE", "Fachlich ausführlich geprüft", "notary", {"notary"}, {"terms": True, "sources": True, "relations": True})
            changed_ttl += '\n<https://notariat8.github.io/ontology/id/case/immobilienkaufvertrag/node/property.identity> <https://example.org/unmodeled> "Zusatz" .\n'
            self.assertIn("Zusätzliche RDF-Änderungen", store.review_detail(42)["problem"])
            with self.assertRaisesRegex(ValueError, "nicht fachlich freigabefähig"):
                store.submit_case_review(42, head, "APPROVE", "Fachlich ausführlich geprüft", "notary", {"notary"}, {"terms": True, "sources": True, "relations": True})
            store.submit_case_review(42, head, "REQUEST_CHANGES", "Bitte zusätzliche RDF-Aussage erläutern", "specialist", set())
        self.assertIn("pullrequestreview", url)
        self.assertEqual(reviewed[0]["commit_id"], head)
        self.assertEqual(reviewed[0]["event"], "APPROVE")
        self.assertIn("Fachlich geprüft", reviewed[0]["body"])
        self.assertEqual(reviewed[1]["event"], "REQUEST_CHANGES")


if __name__ == "__main__":
    unittest.main()
