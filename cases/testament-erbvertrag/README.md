# Testament / Erbvertrag

Vorbereitung und Beurkundung testamentarischer Verfügungen oder Erbverträge mit Geschäftsfähigkeit, Familienlage, Vermögen, Vorverfügungen und Verwahrungsgates.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/testament-erbvertrag/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/testament-erbvertrag.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Vermögen Kategorien"]
        n2["Geschäftsfähigkeit Prüfflaggen"]
        n3["Geschäftswert für GNotKG-Kostenprüfung"]
        n4["Verwahrung Register"]
        n5["Verfügungen Wünsche"]
        n6["Testamentsvollstrecker Auswahl"]
        n7["Familie Struktur"]
        n8["Vorverfügungen Verfügungen"]
        n9["Testierende Person Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Disposition Entwurf"]
        n11["Dokument: Vorverfügungen Verfügungen"]
    end
    subgraph g3["Entscheidungen"]
        n12["Entscheidung: Testamentsvollstrecker"]
        n13["Entscheidung: GNotKG-Kostenweg"]
        n14["Entscheidung: Instrument Art"]
    end
    subgraph g4["Prüfgates"]
        n15["Prüfgate: Bindungswirkung Wirkung Prüfung"]
        n16["Prüfgate: Geschäftsfähigkeit Prüfung"]
        n17["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n18["Nachweis: Geschäftsfähigkeit Vermerke"]
        n19["Nachweis: Verwahrung Registrierung"]
        n20["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n13 -->|blockiert bis vollständig| n17
    n17 -->|belegt durch| n20
    n2 -->|blockiert bis geprüft| n16
    n3 -->|informiert| n13
    n5 -->|füllt| n10
    n8 -->|erfordert| n15
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7,n8,n9 info;
    class n10,n11 doc;
    class n12,n13,n14 decision;
    class n15,n16,n17 gate;
    class n18,n19,n20 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 9 |
| Dokumenttypen | 2 |
| Entscheidungen | 3 |
| Prüfgates | 3 |
| Nachweistypen | 3 |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
