# Immobilienkaufvertrag

Kauf oder Verkauf von Grundstück, Wohnungseigentum, Haus oder Teileigentum mit Grundbuch, Kaufpreisfälligkeit, Finanzierung und Vollzugsgates.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/immobilienkaufvertrag/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/immobilienkaufvertrag.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Identität Käufer"]
        n2["Geschäftswert für GNotKG-Kostenprüfung"]
        n3["Aktueller Belastungsstand"]
        n4["Finanzierung erforderlich"]
        n5["Besitzübergang"]
        n6["Grundstücksidentität"]
        n7["Öffentlich-rechtliche Genehmigungen"]
        n8["Kaufpreis und Fälligkeitsmodell"]
        n9["Identität Verkäufer"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Genehmigungen"]
        n11["Dokument: Vertragsentwurf"]
        n12["Dokument: aktueller Grundbuchauszug"]
    end
    subgraph g3["Entscheidungen"]
        n13["Entscheidung: Umgang mit Belastungen"]
        n14["Entscheidung: Finanzierungsweg"]
        n15["Entscheidung: GNotKG-Kostenweg"]
    end
    subgraph g4["Prüfgates"]
        n16["Prüfgate: Verbraucher-Entwurfsfrist"]
        n17["Prüfgate: Vollzugsbereitschaft"]
        n18["Prüfgate: GNotKG-Kostenprüfung"]
        n19["Prüfgate: Grundbuchprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n20["Nachweis: Einreichungs- und Vollzugsnachverfolgung"]
        n21["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n22["Nachweis: Aufnahmeprüfung und Entwurfsfreigabe"]
    end
    n15 -->|blockiert bis vollständig| n18
    n18 -->|belegt durch| n21
    n2 -->|informiert| n15
    n3 -->|informiert| n13
    n4 -->|informiert| n14
    n6 -->|erfordert| n12
    n7 -->|belegt durch| n20
    n8 -->|blockiert bis vollständig| n17
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7,n8,n9 info;
    class n10,n11,n12 doc;
    class n13,n14,n15 decision;
    class n16,n17,n18,n19 gate;
    class n20,n21,n22 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 9 |
| Dokumenttypen | 3 |
| Entscheidungen | 3 |
| Prüfgates | 4 |
| Nachweistypen | 3 |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/bgb/__311b.html](https://www.gesetze-im-internet.de/bgb/__311b.html)
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
