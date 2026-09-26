# Geschäftsanteilsübertragung GmbH

Kauf, Schenkung oder sonstige Übertragung von GmbH-Geschäftsanteilen mit Beteiligten, Anteilskette, Zustimmungsvorbehalten, Kaufpreis, Gesellschafterliste und Register-Nachweisen.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/geschaeftsanteilsuebertragung-gmbh/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/geschaeftsanteilsuebertragung-gmbh.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Käufer Identität"]
        n2["Gesellschaft Identität"]
        n3["Zustimmungen Beschraenkungen"]
        n4["Gegenleistung Steuer"]
        n5["Geschäftswert für GNotKG-Kostenprüfung"]
        n6["Verkäufer Identität"]
        n7["Geschäftsanteil Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Zustimmung Nachweis"]
        n9["Dokument: Gesellschafterliste"]
        n10["Dokument: Übertragung Vereinbarung"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: Zustimmung erforderlich"]
        n12["Entscheidung: GNotKG-Kostenweg"]
        n13["Entscheidung: Übertragung Art"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: Kette von Titel Prüfung"]
        n15["Prüfgate: GNotKG-Kostenprüfung"]
        n16["Prüfgate: Gesellschafter Liste bereit"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n18["Nachweis: Gesellschafter Liste Einreichung"]
        n19["Nachweis: Übertragung Prüfung"]
    end
    n1 -->|füllt| n9
    n12 -->|blockiert bis vollständig| n15
    n15 -->|belegt durch| n17
    n3 -->|erfordert Entscheidung| n11
    n5 -->|informiert| n12
    n7 -->|blockiert bis geprüft| n14
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7 info;
    class n8,n9,n10 doc;
    class n11,n12,n13 decision;
    class n14,n15,n16 gate;
    class n17,n18,n19 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 7 |
| Dokumenttypen | 3 |
| Entscheidungen | 3 |
| Prüfgates | 3 |
| Nachweistypen | 3 |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/gmbhg/](https://www.gesetze-im-internet.de/gmbhg/)
- [https://www.gesetze-im-internet.de/hgb/__12.html](https://www.gesetze-im-internet.de/hgb/__12.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
