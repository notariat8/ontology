# Erbscheinsantrag / Nachlassangelegenheiten

Antrag und Erklärungen für Erbschein, Nachlassgericht, Ausschlagung, eidesstattliche Versicherung und erbrechtliche Nachweisführung.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/erbscheinsantrag-nachlass/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/erbscheinsantrag-nachlass.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Antragsteller Identität"]
        n2["Geschäftswert für GNotKG-Kostenprüfung"]
        n3["Erblasser Identität"]
        n4["Verfügungen Nachweis"]
        n5["Familie Nachweis"]
        n6["Erbenstellung Grundlage"]
        n7["Eidesstattliche Versicherung Erklärung"]
        n8["Ausschlagungen Ausschlagungen"]
        n9["Wohnsitz Zuständigkeit"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Antrag Entwurf"]
        n11["Dokument: Sterbefall Bescheinigung Referenz"]
        n12["Dokument: Familie Nachweis"]
    end
    subgraph g3["Entscheidungen"]
        n13["Entscheidung: Bescheinigung Art"]
        n14["Entscheidung: GNotKG-Kostenweg"]
        n15["Entscheidung: Eidesstattliche Versicherung erforderlich"]
    end
    subgraph g4["Prüfgates"]
        n16["Prüfgate: GNotKG-Kostenprüfung"]
        n17["Prüfgate: Erbenstellung Prüfung"]
        n18["Prüfgate: Eidesstattliche Versicherung Bereitschaft"]
    end
    subgraph g5["Nachweistypen"]
        n19["Nachweis: Gericht Einreichung"]
        n20["Nachweis: Nachweis Paket"]
        n21["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n14 -->|blockiert bis vollständig| n16
    n16 -->|belegt durch| n21
    n2 -->|informiert| n14
    n5 -->|belegt durch| n20
    n6 -->|blockiert bis geprüft| n17
    n7 -->|erfordert| n18
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7,n8,n9 info;
    class n10,n11,n12 doc;
    class n13,n14,n15 decision;
    class n16,n17,n18 gate;
    class n19,n20,n21 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 9 |
| Dokumenttypen | 3 |
| Entscheidungen | 3 |
| Prüfgates | 3 |
| Nachweistypen | 3 |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/bgb/__2353.html](https://www.gesetze-im-internet.de/bgb/__2353.html)
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
