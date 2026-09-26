"""Validate the public RDF catalog without accessing NaC or live case data."""

from pathlib import Path
import sys

from rdflib import Graph, Namespace, RDF


ROOT = Path(__file__).resolve().parents[1]
N8 = Namespace("https://notariat8.github.io/ontology/id/")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")


def main() -> int:
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

    print(f"OK: {len(graph)} RDF triples, {len(entries)} unique NaC business-case types")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"Catalog validation failed: {exc}", file=sys.stderr)
        sys.exit(1)
