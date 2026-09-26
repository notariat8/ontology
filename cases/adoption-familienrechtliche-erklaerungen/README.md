# Adoption / familienrechtliche Erklärungen

Notarielle Adoptionszustimmungen und familienrechtliche Erklärungen mit Identität, Zustimmungspersonen, Gerichtsziel, Geschäftsfähigkeit, Unwiderruflichkeit und Schutz sensibler Daten.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/adoption-familienrechtliche-erklaerungen/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/adoption-familienrechtliche-erklaerungen.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Weitere Genehmigungen"]
        n2["Fall Art"]
        n3["Kind Identität Kontext"]
        n4["Zustimmende Beteiligter Identität"]
        n5["Geschäftswert für GNotKG-Kostenprüfung"]
        n6["Gericht Zielgericht"]
        n7["Unwiderruflichkeit Belehrung"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Zustimmung Erklärung"]
        n9["Dokument: Gericht Referenz"]
    end
    subgraph g3["Entscheidungen"]
        n10["Entscheidung: Genehmigung Status"]
        n11["Entscheidung: Erklärung Route"]
        n12["Entscheidung: GNotKG-Kostenweg"]
    end
    subgraph g4["Prüfgates"]
        n13["Prüfgate: Geschäftsfähigkeit and Belehrung"]
        n14["Prüfgate: Gericht Zustellung"]
        n15["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n16["Nachweis: Familie Gericht Zustellung"]
        n17["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n18["Nachweis: Belehrung Vermerke"]
    end
    n1 -->|erfordert Entscheidung| n10
    n12 -->|blockiert bis vollständig| n15
    n15 -->|belegt durch| n17
    n5 -->|informiert| n12
    n6 -->|belegt durch| n16
    n7 -->|blockiert bis geprüft| n13
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7 info;
    class n8,n9 doc;
    class n10,n11,n12 decision;
    class n13,n14,n15 gate;
    class n16,n17,n18 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 7 |
| Dokumenttypen | 2 |
| Entscheidungen | 3 |
| Prüfgates | 3 |
| Nachweistypen | 3 |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/bgb/__1750.html](https://www.gesetze-im-internet.de/bgb/__1750.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
