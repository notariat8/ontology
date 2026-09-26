# Handelsregisteranmeldung

Registeranmeldung für Änderungen wie Geschäftsführerwechsel, Sitzverlegung, Kapitalmaßnahmen, Firma, Unternehmensgegenstand oder Prokura.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/handelsregisteranmeldung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/handelsregisteranmeldung.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Anlagen erforderlich"]
        n2["Gesellschaftsrecht Beschluss"]
        n3["Geschäftswert für GNotKG-Kostenprüfung"]
        n4["Wirksamkeit Datum"]
        n5["Rechtsträger Identität"]
        n6["Vorgang Art"]
        n7["Gebühren Kosten"]
        n8["Unterzeichner Identität"]
        n9["XNP Route"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Gesellschaftsrecht Nachweis"]
        n11["Dokument: Register Antrag"]
    end
    subgraph g3["Entscheidungen"]
        n12["Entscheidung: Vorgang Route"]
        n13["Entscheidung: GNotKG-Kostenweg"]
        n14["Entscheidung: Unterschrift Methode"]
    end
    subgraph g4["Prüfgates"]
        n15["Prüfgate: Elektronisch Format"]
        n16["Prüfgate: GNotKG-Kostenprüfung"]
        n17["Prüfgate: Öffentlich Beglaubigung"]
    end
    subgraph g5["Nachweistypen"]
        n18["Nachweis: Beglaubigung Nachverfolgung"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n20["Nachweis: Register Rückmeldung"]
    end
    n13 -->|blockiert bis vollständig| n16
    n16 -->|belegt durch| n19
    n3 -->|informiert| n13
    n6 -->|bestimmt| n1
    n8 -->|blockiert bis geprüft| n17
    n9 -->|belegt durch| n20
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
- [https://www.gesetze-im-internet.de/gmbhg/](https://www.gesetze-im-internet.de/gmbhg/)
- [https://www.gesetze-im-internet.de/hgb/__12.html](https://www.gesetze-im-internet.de/hgb/__12.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
