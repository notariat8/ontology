# Erbausschlagung

Erbausschlagungserklärung gegenüber dem Nachlassgericht mit Frist, Identität, Vertretung, Minderjährigen- oder Betreuungsbezug und Zustellnachweis.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/erbausschlagung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/erbausschlagung.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Geschäftswert für GNotKG-Kostenprüfung"]
        n2["Frist Status"]
        n3["Erblasser Identität"]
        n4["Zustellung Route"]
        n5["Erbenstellung Grundlage"]
        n6["Ausschlagende Person Identität"]
        n7["Representation Minderjährige"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Genehmigung Nachweis"]
        n9["Dokument: Sterbefall oder Gericht Referenz"]
        n10["Dokument: Ausschlagung Erklärung"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: Genehmigung erforderlich"]
        n12["Entscheidung: Frist Risiko"]
        n13["Entscheidung: GNotKG-Kostenweg"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: Gericht Zustellung"]
        n15["Prüfgate: Frist Prüfung"]
        n16["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: Frist Prüfung"]
        n18["Nachweis: Zustellung Nachverfolgung"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n1 -->|informiert| n13
    n13 -->|blockiert bis vollständig| n16
    n16 -->|belegt durch| n19
    n2 -->|blockiert bis geprüft| n15
    n4 -->|belegt durch| n18
    n7 -->|erfordert Entscheidung| n11
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
- [https://www.gesetze-im-internet.de/bgb/__1945.html](https://www.gesetze-im-internet.de/bgb/__1945.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
