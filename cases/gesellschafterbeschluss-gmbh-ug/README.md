# Gesellschafterbeschluss bei GmbH/UG

Gesellschafterbeschlüsse bei GmbH/UG zu Satzungsänderungen, Kapitalmaßnahmen, Geschäftsführerbestellung, Anteilszustimmungen oder sonstigen Gesellschaftsentscheidungen.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/gesellschafterbeschluss-gmbh-ug/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/gesellschafterbeschluss-gmbh-ug.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Satzung Wortlaut"]
        n2["Gesellschaft Identität"]
        n3["Geschäftswert für GNotKG-Kostenprüfung"]
        n4["Mehrheit Anforderung"]
        n5["Register Einreichung"]
        n6["Beschluss Art"]
        n7["Gesellschafter anwesend"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Aktueller Stand Satzung"]
        n9["Dokument: Register Antrag"]
        n10["Dokument: Beschluss Protokoll"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: GNotKG-Kostenweg"]
        n12["Entscheidung: Notariell Form"]
        n13["Entscheidung: Register Relevanz"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: GNotKG-Kostenprüfung"]
        n15["Prüfgate: Beschlussfähigkeit Mehrheit Prüfung"]
        n16["Prüfgate: Register Paket bereit"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n18["Nachweis: Register Nachverfolgung"]
        n19["Nachweis: Beschluss Prüfung"]
    end
    n1 -->|erfordert| n8
    n11 -->|blockiert bis vollständig| n14
    n14 -->|belegt durch| n17
    n3 -->|informiert| n11
    n5 -->|erfordert| n16
    n7 -->|blockiert bis geprüft| n15
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
- [https://www.gesetze-im-internet.de/gmbhg/__53.html](https://www.gesetze-im-internet.de/gmbhg/__53.html)
- [https://www.gesetze-im-internet.de/hgb/__12.html](https://www.gesetze-im-internet.de/hgb/__12.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
