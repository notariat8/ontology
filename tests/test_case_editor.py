# SPDX-License-Identifier: AGPL-3.0-or-later
"""Regression checks for preserving RDF while editing through the browser model."""

import sys
from pathlib import Path
import json
import shutil
import tempfile
import unittest
from unittest.mock import patch

from rdflib import Graph, Literal, URIRef
from rdflib.compare import to_isomorphic

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from case_editor_model import DCT, N8, ROOT, case_uri, graph_from_model, load_case, prepare_change
import case_editor
import case_editor_model
import render_case_docs
import validate_cases


SLUG = "immobilienkaufvertrag"


class CaseEditorTests(unittest.TestCase):
    def setUp(self):
        self.model = load_case(SLUG)
        self.original = Graph().parse(ROOT / "cases" / SLUG / "ontology.ttl", format="turtle")

    def test_unchanged_form_is_semantically_identical_and_does_not_rewrite(self):
        candidate = graph_from_model(SLUG, self.model, self.original)
        self.assertEqual(to_isomorphic(candidate), to_isomorphic(self.original))
        ttl, page, changed = prepare_change(SLUG, self.model, self.model["revision"])
        self.assertFalse(changed)
        self.assertEqual(ttl, (ROOT / "cases" / SLUG / "ontology.ttl").read_text(encoding="utf-8"))
        self.assertIn("flowchart LR", page)

    def test_change_keeps_unknown_triples_and_pinned_source(self):
        extra_predicate = URIRef("https://example.org/custom")
        subject = URIRef(f"{N8}case/{SLUG}/node/property.identity")
        self.original.add((subject, extra_predicate, Literal("untouched")))
        source = self.original.value(case_uri(SLUG), DCT.source)
        self.model["nodes"][0]["label"] = "Geänderter Fachbegriff"
        candidate = graph_from_model(SLUG, self.model, self.original)
        self.assertIn((subject, extra_predicate, Literal("untouched")), candidate)
        self.assertEqual(candidate.value(case_uri(SLUG), DCT.source), source)
        self.assertNotEqual(to_isomorphic(candidate), to_isomorphic(self.original))

    def test_add_local_node_and_relation_without_claiming_nac_origin(self):
        new_node = {
            "id": "local.new-question",
            "category": "required_information",
            "label": "Neue Fachfrage",
            "status": "local-draft",
            "question": "Was ist zu klären?",
            "owner_role": "notary",
            "privacy_class": "",
            "document_source": "",
            "contains_personal_data": None,
            "required_for": [],
            "options": [],
        }
        self.model["nodes"].append(new_node)
        self.model["edges"].append({"from": new_node["id"], "type": "informiert", "to": "decision.financing_route"})
        candidate = graph_from_model(SLUG, self.model, self.original)
        subject = URIRef(f"{N8}case/{SLUG}/node/local.new-question")
        self.assertEqual(str(candidate.value(subject, N8.lokaleNodeId)), new_node["id"])
        self.assertIsNone(candidate.value(subject, N8.nacNodeId))
        self.assertEqual(str(candidate.value(subject, N8.pflegeStatus)), "local-draft")
        self.assertIsNone(candidate.value(subject, N8.quellstatus))
        ttl, page, changed = prepare_change(SLUG, self.model, self.model["revision"])
        self.assertTrue(changed)
        self.assertIn("Neue Fachfrage", page)
        self.assertEqual(to_isomorphic(Graph().parse(data=ttl, format="turtle")), to_isomorphic(candidate))

    def test_rejects_unknown_case_and_stale_revision(self):
        with self.assertRaisesRegex(ValueError, "Unbekannter Fall"):
            load_case("../NaC")
        with self.assertRaisesRegex(ValueError, "inzwischen geändert"):
            prepare_change(SLUG, self.model, "wrong")

    def test_rejects_real_case_values_and_dangling_edges(self):
        self.model["nodes"][0]["value"] = "private data"
        # The editable schema ignores extra fields rather than writing them to RDF.
        candidate = graph_from_model(SLUG, self.model, self.original)
        self.assertFalse(any(str(predicate).endswith("/value") for _, predicate, _ in candidate))
        self.model["edges"][0]["to"] = "missing.node"
        with self.assertRaisesRegex(ValueError, "Ungültige oder doppelte Beziehung"):
            graph_from_model(SLUG, self.model, self.original)

    def test_save_writes_turtle_and_matching_mermaid_in_isolated_copy(self):
        with tempfile.TemporaryDirectory() as location:
            copy_root = Path(location)
            (copy_root / "catalog").mkdir()
            (copy_root / "cases" / SLUG).mkdir(parents=True)
            shutil.copy2(ROOT / "catalog/nac-baseline.json", copy_root / "catalog/nac-baseline.json")
            shutil.copy2(ROOT / "catalog/nac-usecases.ttl", copy_root / "catalog/nac-usecases.ttl")
            shutil.copy2(ROOT / "cases" / SLUG / "ontology.ttl", copy_root / "cases" / SLUG / "ontology.ttl")
            shutil.copy2(ROOT / "cases" / SLUG / "README.md", copy_root / "cases" / SLUG / "README.md")
            with (
                patch.object(case_editor_model, "ROOT", copy_root),
                patch.object(render_case_docs, "ROOT", copy_root),
                patch.object(validate_cases, "ROOT", copy_root),
                patch.object(case_editor, "git_branch", return_value="codex/test"),
            ):
                model = load_case(SLUG)
                model["nodes"][0]["label"] = "Fachlich geänderter Begriff"
                result = case_editor.write_change(SLUG, model)
                self.assertTrue(result["changed"])
                self.assertIn("Fachlich geänderter Begriff", (copy_root / "cases" / SLUG / "README.md").read_text(encoding="utf-8"))
                self.assertEqual(
                    render_case_docs.render(SLUG),
                    (copy_root / "cases" / SLUG / "README.md").read_text(encoding="utf-8"),
                )
                self.assertEqual(
                    result["revision"],
                    case_editor_model.revision(copy_root / "cases" / SLUG / "ontology.ttl"),
                )
                ref = json.loads((copy_root / "catalog/nac-baseline.json").read_text(encoding="utf-8"))["source_ref"]
                self.assertEqual(validate_cases.check_one(SLUG, ref, None), (22, 8))
                amended = load_case(SLUG)
                amended["nodes"].append({
                    "id": "local.review-question", "category": "required_information",
                    "label": "Zusätzliche Fachfrage", "status": "local-draft",
                    "question": "", "owner_role": "", "privacy_class": "",
                    "document_source": "", "contains_personal_data": None,
                    "required_for": [], "options": [],
                })
                amended["edges"].append({"from": "local.review-question", "type": "informiert", "to": "decision.financing_route"})
                case_editor.write_change(SLUG, amended)
                self.assertEqual(validate_cases.check_one(SLUG, ref, None), (23, 9))


if __name__ == "__main__":
    unittest.main()
