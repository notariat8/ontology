"""Validate the fixed NaC RDF catalog without accessing live case data."""

import argparse
import json
from pathlib import Path
import sys

from rdflib import Graph, Namespace, RDF, URIRef


ROOT = Path(__file__).resolve().parents[1]
N8 = Namespace("https://notariat8.github.io/ontology/id/")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nac-root", type=Path, help="Optional local NaC checkout for cross-repository checks")
    args = parser.parse_args()
    baseline = json.loads((ROOT / "catalog/nac-baseline.json").read_text(encoding="utf-8"))
    expected = set(baseline["business_case_type_ids"])
    if baseline["canonical_count"] != len(expected) or len(expected) != 20:
        raise ValueError("NaC baseline must lock exactly 20 unique canonical IDs")
    graph = Graph()
    for path in (ROOT / "ontology/core.ttl", ROOT / "catalog/nac-usecases.ttl"):
        graph.parse(path, format="turtle")

    entries = set(graph.subjects(RDF.type, N8.Vorgangsart))
    if not entries:
        raise ValueError("catalog contains no Vorgangsart entries")

    ids: set[str] = set()
    for entry in entries:
        values = list(graph.objects(entry, N8.hatBusinessCaseTypeId))
        labels = [label for label in graph.objects(entry, SKOS.prefLabel) if label.language == "de"]
        areas = list(graph.objects(entry, N8.hatFachbereich))
        if len(values) != 1 or len(labels) != 1 or len(areas) != 1:
            raise ValueError(f"{entry}: expected one NaC ID, German label and Fachbereich")
        slug = str(values[0])
        if slug in ids or not slug or not all(c.islower() or c.isdigit() or c == "-" for c in slug):
            raise ValueError(f"{entry}: duplicate or malformed NaC ID {slug!r}")
        ids.add(slug)
        if (entry, SKOS.inScheme, N8["nac-vorgangsarten"]) not in graph:
            raise ValueError(f"{entry}: missing concept scheme")
        ref = baseline["source_ref"]
        expected_usecase = URIRef(f"https://github.com/notariat8/NaC/tree/{ref}/usecases/{slug}")
        bpmn_path = "bpmn/immobilienkaufvertrag.bpmn" if slug == "immobilienkaufvertrag" else f"bpmn/usecases/{slug}.bpmn"
        expected_bpmn = URIRef(f"https://github.com/notariat8/NaC/blob/{ref}/{bpmn_path}")
        if list(graph.objects(entry, N8.hatNaCUsecase)) != [expected_usecase]:
            raise ValueError(f"{entry}: NaC usecase link does not match the pinned baseline")
        if list(graph.objects(entry, N8.hatBpmnModell)) != [expected_bpmn]:
            raise ValueError(f"{entry}: BPMN link does not match the pinned baseline")

    if ids != expected:
        raise ValueError(f"catalog differs from the NaC 20-case baseline: missing={sorted(expected - ids)}, extra={sorted(ids - expected)}")

    if args.nac_root:
        usecases = args.nac_root / "usecases"
        actual = {p.name for p in usecases.iterdir() if p.is_dir() and (p / "knowledge-graph.graph.json").exists()}
        actual -= set(baseline["legacy_aliases_excluded"])
        if actual != expected:
            raise ValueError(f"NaC checkout differs from baseline: missing={sorted(expected - actual)}, extra={sorted(actual - expected)}")
        for slug in expected:
            bpmn = args.nac_root / "bpmn" / ("immobilienkaufvertrag.bpmn" if slug == "immobilienkaufvertrag" else f"usecases/{slug}.bpmn")
            if not bpmn.is_file():
                raise ValueError(f"missing NaC BPMN model: {bpmn}")

    print(f"OK: {len(graph)} RDF triples, exactly {len(entries)} NaC business-case types" + ("; local NaC checkout matches" if args.nac_root else ""))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"Catalog validation failed: {exc}", file=sys.stderr)
        sys.exit(1)
