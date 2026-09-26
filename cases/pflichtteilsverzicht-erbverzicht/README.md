# Pflichtteilsverzicht / Erbverzicht

Vertraglicher Erb- oder Pflichtteilsverzicht, häufig in der Familiennachfolge, mit Beteiligten, Umfang, Abfindung, Erstreckung auf Abkoemmlinge und Fairness-Prüfung.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/pflichtteilsverzicht-erbverzicht/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/pflichtteilsverzicht-erbverzicht.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Abfindung Modell"]
        n2["Geschäftswert für GNotKG-Kostenprüfung"]
        n3["Abkoemmlinge Wirkung"]
        n4["Familie Fairness Prüfflaggen"]
        n5["Künftiger Erblasser Identität"]
        n6["Verzicht Umfang"]
        n7["Verzicht Beteiligter Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Abfindung Nachweis"]
        n9["Dokument: Verzicht Vertrag"]
    end
    subgraph g3["Entscheidungen"]
        n10["Entscheidung: Abfindung"]
        n11["Entscheidung: GNotKG-Kostenweg"]
        n12["Entscheidung: Verzicht Art"]
    end
    subgraph g4["Prüfgates"]
        n13["Prüfgate: Fairness Prüfung"]
        n14["Prüfgate: GNotKG-Kostenprüfung"]
        n15["Prüfgate: Persoenlich Anwesenheit Prüfung"]
    end
    subgraph g5["Nachweistypen"]
        n16["Nachweis: Vollzug Nachverfolgung"]
        n17["Nachweis: Fairness Vermerke"]
        n18["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n1 -->|erfordert Entscheidung| n10
    n11 -->|blockiert bis vollständig| n14
    n14 -->|belegt durch| n18
    n2 -->|informiert| n11
    n4 -->|blockiert bis geprüft| n13
    n6 -->|erfordert Entscheidung| n12
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
- [https://www.gesetze-im-internet.de/bgb/__2346.html](https://www.gesetze-im-internet.de/bgb/__2346.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
