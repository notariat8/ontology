"""One-time import of NaC template graphs into editable case Turtle modules.

Existing case files are never overwritten. Later maintenance happens in Turtle.
"""

import argparse
import json
from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://notariat8.github.io/ontology/id/"
CATEGORIES = {
    "required_information": ("Angabenfrage", "Angabenfragen"),
    "documents": ("Dokumenttyp", "Dokumenttypen"),
    "decisions": ("Entscheidungspunkt", "Entscheidungen"),
    "gates": ("Pruefgate", "Prüfgates"),
    "evidence": ("Nachweistyp", "Nachweistypen"),
}
EDGES = {
    "requires": "erfordert",
    "informs": "informiert",
    "blocks_until_complete": "blockiertBisVollstaendig",
    "blocks_until_reviewed": "blockiertBisGeprueft",
    "requires_decision": "erfordertEntscheidung",
    "evidenced_by": "belegtDurch",
    "populates": "fuellt",
    "determines": "bestimmt",
}


def quoted(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def node_uri(slug: str, node_id: str) -> str:
    return f"<{BASE}case/{slug}/node/{node_id}>"


def source_json(nac_root: Path, ref: str, slug: str) -> dict:
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"invalid NaC slug: {slug}")
    rel = f"usecases/{slug}/knowledge-graph.graph.json"
    raw = subprocess.check_output(
        ["git", "-c", f"safe.directory={nac_root.as_posix()}", "show", f"{ref}:{rel}"],
        cwd=nac_root,
    )
    return json.loads(raw)


def case_turtle(slug: str, ref: str, data: dict) -> str:
    if len(data.get("cases", [])) != 1 or data["cases"][0].get("slug") != slug:
        raise ValueError(f"{slug}: expected exactly one matching NaC case")
    case = data["cases"][0]
    if case.get("legacy_alias"):
        raise ValueError(f"{slug}: legacy aliases must not be imported")
    sources = {item["id"]: item for item in data["source_refs"]}
    all_nodes = [item for key in CATEGORIES for item in case[key]]
    ids = [item["id"] for item in all_nodes]
    if len(ids) != len(set(ids)):
        raise ValueError(f"{slug}: duplicate local node ID")
    if any(item.get("value") is not None for item in all_nodes):
        raise ValueError(f"{slug}: source contains a non-null case value")
    for edge in case["edges"]:
        if edge["from"] not in ids or edge["to"] not in ids or edge["type"] not in EDGES:
            raise ValueError(f"{slug}: unsupported or dangling edge: {edge}")
    legal = [sources[key]["url"] for key in case["legal_anchors"]]
    source_url = f"https://github.com/notariat8/NaC/blob/{ref}/usecases/{slug}/knowledge-graph.graph.json"
    lines = [
        "# SPDX-License-Identifier: CC-BY-4.0",
        "# Edit this Turtle file for fachliche Pflege; Mermaid is derived from it.",
        "@prefix n8: <https://notariat8.github.io/ontology/id/> .",
        "@prefix dcterms: <http://purl.org/dc/terms/> .",
        "@prefix skos: <http://www.w3.org/2004/02/skos/core#> .",
        "",
        f"n8:vorgangsart-{slug}",
        f"  dcterms:description {quoted(case['summary'])}@de ;",
        f"  dcterms:source <{source_url}> ;",
        "  dcterms:license <https://creativecommons.org/licenses/by/4.0/> ;",
    ]
    for url in legal:
        lines.append(f"  dcterms:references <{url}> ;")
    for node_id in ids:
        lines.append(f"  n8:hatBaustein {node_uri(slug, node_id)} ;")
    lines[-1] = lines[-1][:-2] + " ."
    lines.append("")
    for key, (class_name, heading) in CATEGORIES.items():
        lines.extend([f"# {heading}", ""])
        for item in case[key]:
            attrs = [
                f"a n8:{class_name}",
                f"n8:nacNodeId {quoted(item['id'])}",
                f"skos:prefLabel {quoted(item['label'])}@de",
                f"n8:quellstatus {quoted(item['status'])}",
            ]
            if item.get("question"):
                attrs.append(f"n8:offeneFrage {quoted(item['question'])}@de")
            if item.get("owner_role"):
                attrs.append(f"n8:verantwortlicheRolle {quoted(item['owner_role'])}")
            if item.get("privacy_class"):
                attrs.append(f"n8:datenschutzklasse {quoted(item['privacy_class'])}")
            for context in item.get("required_for", []):
                attrs.append(f"n8:erforderlichFuer {quoted(context)}")
            for option in item.get("options", []):
                attrs.append(f"n8:entscheidungsoption {quoted(option)}")
            if item.get("source"):
                attrs.append(f"n8:dokumentquelle {quoted(item['source'])}@de")
            if "contains_personal_data" in item:
                attrs.append(f"n8:enthaeltPersonendaten {str(item['contains_personal_data']).lower()}")
            lines.append(node_uri(slug, item["id"]) + " " + " ;\n  ".join(attrs) + " .")
            lines.append("")
    lines.extend(["# Beziehungen aus dem NaC-Vorlagengraphen; keine BPMN-Sequenzflüsse.", ""])
    for edge in case["edges"]:
        lines.append(f"{node_uri(slug, edge['from'])} n8:{EDGES[edge['type']]} {node_uri(slug, edge['to'])} .")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nac-root", type=Path, required=True)
    parser.add_argument("--write", action="store_true", help="Create missing Turtle files (never overwrite)")
    args = parser.parse_args()
    baseline = json.loads((ROOT / "catalog/nac-baseline.json").read_text(encoding="utf-8"))
    for slug in baseline["business_case_type_ids"]:
        destination = ROOT / "cases" / slug / "ontology.ttl"
        if destination.exists():
            raise FileExistsError(f"Refusing to overwrite maintained ontology: {destination}")
        data = source_json(args.nac_root, baseline["source_ref"], slug)
        turtle = case_turtle(slug, baseline["source_ref"], data)
        if args.write:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(turtle, encoding="utf-8", newline="\n")
    print("20 NaC template graphs checked" + (" and imported" if args.write else "; use --write to create"))


if __name__ == "__main__":
    main()
