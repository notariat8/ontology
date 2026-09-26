# Löschungsbewilligung / Grundbuchlöschung

Löschung eingetragener Rechte im Grundbuch, häufig alter Grundschulden nach Darlehensrückzahlung, mit Bewilligung, Eigentümerzustimmung, Urkundenform und Einreichungsnachweis.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/loeschungsbewilligung-grundbuchloeschung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/loeschungsbewilligung-grundbuchloeschung.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Brief Status"]
        n2["Geschäftswert für GNotKG-Kostenprüfung"]
        n3["Glaeubiger Berechtigung"]
        n4["Einreichung Route"]
        n5["Eigentümer Zustimmung"]
        n6["Grundstück Identität"]
        n7["Recht Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Löschung Zustimmung"]
        n9["Dokument: aktueller Grundbuchauszug"]
        n10["Dokument: Recht Brief"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: Brief Behandlung"]
        n12["Entscheidung: Löschung Art"]
        n13["Entscheidung: GNotKG-Kostenweg"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: Berechtigung Prüfung"]
        n15["Prüfgate: Einreichung bereit"]
        n16["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: Berechtigung Nachverfolgung"]
        n18["Nachweis: Löschung Abschluss"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n1 -->|erfordert Entscheidung| n11
    n13 -->|blockiert bis vollständig| n16
    n16 -->|belegt durch| n19
    n2 -->|informiert| n13
    n3 -->|blockiert bis geprüft| n14
    n7 -->|erfordert| n9
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
- [https://www.gesetze-im-internet.de/bgb/__875.html](https://www.gesetze-im-internet.de/bgb/__875.html)
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
