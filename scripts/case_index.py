# SPDX-License-Identifier: AGPL-3.0-or-later
"""Build a small, read-only index of the pinned NaC case building blocks."""

from __future__ import annotations

from rdflib import Graph

from case_editor_model import N8, SKOS, _graph_to_model, slugs


def build_case_index(catalog_text: str, cases: dict[str, str], source_ref: str) -> dict:
    pinned = slugs()
    if set(cases) != set(pinned):
        raise ValueError("Die Fallübersicht muss genau die 20 NaC-Fälle enthalten")
    catalog = Graph().parse(data=catalog_text, format="turtle")
    entries = []
    for slug in pinned:
        title = catalog.value(N8[f"vorgangsart-{slug}"], SKOS.prefLabel)
        if title is None:
            raise ValueError(f"Bezeichnung der Vorgangsart fehlt: {slug}")
        model = _graph_to_model(slug, Graph().parse(data=cases[slug], format="turtle"))
        for node in model["nodes"]:
            entries.append({
                "slug": slug,
                "case_title": str(title),
                "node_id": node["id"],
                "label": node["label"],
                "category": node["category"],
                "question": node["question"],
                "detail": node["detail"],
            })
    return {"source_ref": source_ref, "case_count": len(pinned), "entries": entries}
