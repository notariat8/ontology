"""Validate all 20 case ontologies; optionally audit the pinned NaC source."""

import argparse
import json
from pathlib import Path
import sys

from rdflib import Graph, Namespace, RDF, URIRef

from bootstrap_from_nac import CATEGORIES, EDGES, source_json
from render_case_docs import render


ROOT = Path(__file__).resolve().parents[1]
N8 = Namespace("https://notariat8.github.io/ontology/id/")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")
DCT = Namespace("http://purl.org/dc/terms/")
EDGE_PREDICATES = {N8[name] for name in EDGES.values()}


def check_one(slug: str, source_ref: str, nac_root: Path | None) -> tuple[int, int]:
    path = ROOT / "cases" / slug / "ontology.ttl"
    page = ROOT / "cases" / slug / "README.md"
    graph = Graph().parse(path, format="turtle")
    case = N8[f"vorgangsart-{slug}"]
    source_url = URIRef(f"https://github.com/notariat8/NaC/blob/{source_ref}/usecases/{slug}/knowledge-graph.graph.json")
    if list(graph.objects(case, DCT.source)) != [source_url]:
        raise ValueError(f"{slug}: missing or wrong pinned NaC source")
    if list(graph.objects(case, DCT.license)) != [URIRef("https://creativecommons.org/licenses/by/4.0/")]:
        raise ValueError(f"{slug}: missing CC-BY-4.0 license link")
    nodes = set(graph.objects(case, N8.hatBaustein))
    if not nodes:
        raise ValueError(f"{slug}: no case ontology nodes")
    actual_by_category = {}
    all_ids = set()
    for key, (class_name, _) in CATEGORIES.items():
        typed = {node for node in nodes if (node, RDF.type, N8[class_name]) in graph}
        if not typed:
            raise ValueError(f"{slug}: empty {key}")
        actual_by_category[key] = {}
        for node in typed:
            node_id = list(graph.objects(node, N8.nacNodeId))
            label = [v for v in graph.objects(node, SKOS.prefLabel) if v.language == "de"]
            if len(node_id) != 1 or len(label) != 1 or len(list(graph.objects(node, N8.quellstatus))) != 1:
                raise ValueError(f"{slug}: incomplete typed node {node}")
            if str(node) != f"https://notariat8.github.io/ontology/id/case/{slug}/node/{node_id[0]}":
                raise ValueError(f"{slug}: node IRI is not scoped to its case and source ID: {node}")
            if str(node_id[0]) in all_ids:
                raise ValueError(f"{slug}: duplicate NaC node ID {node_id[0]}")
            all_ids.add(str(node_id[0]))
            actual_by_category[key][str(node_id[0])] = str(label[0])
    if sum(len(v) for v in actual_by_category.values()) != len(nodes):
        raise ValueError(f"{slug}: untyped or multiply typed node")
    if any(str(predicate).endswith(("/value", "#value")) for _, predicate, _ in graph):
        raise ValueError(f"{slug}: case values must not be stored in the ontology")
    edges = set()
    for start, predicate, target in graph:
        if predicate in EDGE_PREDICATES:
            if start not in nodes or target not in nodes:
                raise ValueError(f"{slug}: dangling or cross-case relationship")
            edges.add((str(graph.value(start, N8.nacNodeId)), str(predicate), str(graph.value(target, N8.nacNodeId))))
    if not edges:
        raise ValueError(f"{slug}: no case relationships")
    if not page.is_file() or page.read_text(encoding="utf-8") != render(slug):
        raise ValueError(f"{slug}: Mermaid page missing or out of sync with Turtle")

    if nac_root:
        source = source_json(nac_root, source_ref, slug)
        item = source["cases"][0]
        if item.get("legacy_alias") or item["slug"] != slug:
            raise ValueError(f"{slug}: source is not a canonical case")
        for key in CATEGORIES:
            expected = {n["id"]: n["label"] for n in item[key]}
            if actual_by_category[key] != expected:
                raise ValueError(f"{slug}: {key} node IDs or labels differ from pinned NaC template")
            if any(n.get("value") is not None for n in item[key]):
                raise ValueError(f"{slug}: source includes non-null case value")
        expected_edges = {(e["from"], str(N8[EDGES[e["type"]]]), e["to"]) for e in item["edges"]}
        if edges != expected_edges:
            raise ValueError(f"{slug}: relationships differ from pinned NaC template")
        refs = {n["id"]: n["url"] for n in source["source_refs"]}
        expected_urls = {URIRef(refs[anchor]) for anchor in item["legal_anchors"]}
        if set(graph.objects(case, DCT.references)) != expected_urls:
            raise ValueError(f"{slug}: legal source references differ from pinned NaC template")
        if str(graph.value(case, DCT.description)) != item["summary"]:
            raise ValueError(f"{slug}: case summary differs from pinned NaC template")
    return len(nodes), len(edges)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nac-root", type=Path, help="Audit exact content against pinned NaC commit")
    args = parser.parse_args()
    baseline = json.loads((ROOT / "catalog/nac-baseline.json").read_text(encoding="utf-8"))
    slugs = set(baseline["business_case_type_ids"])
    actual = {path.name for path in (ROOT / "cases").iterdir() if path.is_dir()}
    if actual != slugs or len(slugs) != 20:
        raise ValueError(f"expected exactly the 20 canonical case directories; missing={sorted(slugs-actual)}, extra={sorted(actual-slugs)}")
    total_nodes = total_edges = 0
    for slug in sorted(slugs):
        nodes, edges = check_one(slug, baseline["source_ref"], args.nac_root)
        total_nodes += nodes
        total_edges += edges
    print(f"OK: 20 case TTL modules and Mermaid pages, {total_nodes} typed nodes, {total_edges} relationships" + ("; pinned NaC content matches" if args.nac_root else ""))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"Case validation failed: {exc}", file=sys.stderr)
        sys.exit(1)
