# Vollmacht für Immobilien- oder Gesellschaftsgeschäfte

Notarielle oder öffentlich beglaubigte Vollmachten für Immobilienverträge, Registeranmeldungen, Gesellschafterversammlungen oder Anteilsübertragungen mit Umfang, Form und Nachweisen.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/vollmacht-immobilien-gesellschaftsgeschaefte/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/vollmacht-immobilien-gesellschaftsgeschaefte.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Bevollmaechtigter Identität"]
        n2["Geschäftswert für GNotKG-Kostenprüfung"]
        n3["Zustellung Nachweis"]
        n4["Form Anforderung"]
        n5["Beschraenkungen Ablauf"]
        n6["Vollmachtgeber Identität"]
        n7["Geschäft Umfang"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Vollmacht von Vollmacht"]
        n9["Dokument: Umfang Referenz"]
    end
    subgraph g3["Entscheidungen"]
        n10["Entscheidung: Form Route"]
        n11["Entscheidung: GNotKG-Kostenweg"]
        n12["Entscheidung: Umfang Art"]
    end
    subgraph g4["Prüfgates"]
        n13["Prüfgate: Zustellung Kontrolle"]
        n14["Prüfgate: Form Prüfung"]
        n15["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n16["Nachweis: Ausfertigung Zustellung"]
        n17["Nachweis: Form Prüfung"]
        n18["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n11 -->|blockiert bis vollständig| n15
    n15 -->|belegt durch| n18
    n2 -->|informiert| n11
    n3 -->|belegt durch| n16
    n4 -->|blockiert bis geprüft| n14
    n7 -->|erfordert Entscheidung| n12
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
- [https://www.gesetze-im-internet.de/bgb/__167.html](https://www.gesetze-im-internet.de/bgb/__167.html)
- [https://www.gesetze-im-internet.de/bgb/__311b.html](https://www.gesetze-im-internet.de/bgb/__311b.html)
- [https://www.gesetze-im-internet.de/hgb/__12.html](https://www.gesetze-im-internet.de/hgb/__12.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
