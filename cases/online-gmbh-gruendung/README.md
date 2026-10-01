# GmbH-/UG-Gründung (online)

Gründung einer GmbH oder UG mit Satzung, Gründern, Stammkapital, Geschäftsführung, Registeranmeldung sowie notarieller Identitäts- und Signatur-Readiness.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/online-gmbh-gruendung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/online-gmbh-gruendung.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Wirtschaftlich Berechtigte und GwG-Prüfflaggen"]
        n2["Kapital Struktur"]
        n3["Gesellschaft Name"]
        n4["Gesellschaft Objekt"]
        n5["Gesellschaft Sitz"]
        n6["Geschäftswert für GNotKG-Kostenprüfung"]
        n7["Gründer Identität"]
        n8["Bestellung und Vertretung der Geschäftsführung"]
        n9["Register Route"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Satzung"]
        n11["Dokument: Register Antrag"]
        n12["Dokument: Gesellschafterliste"]
    end
    subgraph g3["Entscheidungen"]
        n13["Entscheidung: GNotKG-Kostenweg"]
        n14["Entscheidung: Musterprotokoll oder individuelle Satzung"]
        n15["Entscheidung: Online-Beurkundungsroute"]
    end
    subgraph g4["Prüfgates"]
        n16["Prüfgate: Karten-, XNP- und Signaturbereitschaft"]
        n17["Prüfgate: GNotKG-Kostenprüfung"]
        n18["Prüfgate: Register Einreichung bereit"]
    end
    subgraph g5["Nachweistypen"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n20["Nachweis: Registereinreichungsnachverfolgung"]
        n21["Nachweis: Technische Bereitschaftsnachweise"]
    end
    n1 -->|blockiert bis geprüft| n18
    n13 -->|blockiert bis vollständig| n17
    n17 -->|belegt durch| n19
    n6 -->|informiert| n13
    n7 -->|füllt| n12
    n8 -->|füllt| n11
    n9 -->|erfordert| n16
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
- [https://www.gesetze-im-internet.de/gmbhg/](https://www.gesetze-im-internet.de/gmbhg/)
- [https://www.gesetze-im-internet.de/hgb/__12.html](https://www.gesetze-im-internet.de/hgb/__12.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
