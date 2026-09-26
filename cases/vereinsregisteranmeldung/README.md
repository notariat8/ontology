# Vereinsregisteranmeldung

Vereinsregisteranmeldungen für Vorstandswechsel, Satzungsänderungen, Gründung oder Aufloesung mit öffentlicher Beglaubigung, Beschlüssen und Anlagen.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/vereinsregisteranmeldung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/vereinsregisteranmeldung.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Satzung aktueller Stand"]
        n2["Verein Identität"]
        n3["Vorstand Identität"]
        n4["Geschäftswert für GNotKG-Kostenprüfung"]
        n5["Einreichung Route"]
        n6["Einreichung Art"]
        n7["Beschluss Nachweis"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Satzung"]
        n9["Dokument: Protokoll Beschluss"]
        n10["Dokument: Register Antrag"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: Anlage Vollständigkeit"]
        n12["Entscheidung: Beglaubigung Route"]
        n13["Entscheidung: GNotKG-Kostenweg"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: GNotKG-Kostenprüfung"]
        n15["Prüfgate: Register Paket bereit"]
        n16["Prüfgate: Unterzeichner Berechtigung"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: Beglaubigung Nachverfolgung"]
        n18["Nachweis: Gericht Einreichung"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n13 -->|blockiert bis vollständig| n14
    n14 -->|belegt durch| n19
    n3 -->|blockiert bis geprüft| n16
    n4 -->|informiert| n13
    n5 -->|belegt durch| n18
    n7 -->|belegt durch| n9
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
- [https://www.gesetze-im-internet.de/bgb/__77.html](https://www.gesetze-im-internet.de/bgb/__77.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
