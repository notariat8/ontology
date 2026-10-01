# Teilungserklärung nach WEG

Aufteilung eines Gebaeudes in Wohnungs- oder Teileigentum mit Teilungserklärung, Gemeinschaftsordnung, Plänen, Bescheinigungen und Grundbuchumsetzung.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/teilungserklaerung-weg/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/teilungserklaerung-weg.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Geschäftswert für GNotKG-Kostenprüfung"]
        n2["Belastung Behandlung"]
        n3["Eigentümer Identität"]
        n4["Eigentum Anteile"]
        n5["Pläne Bescheinigungen"]
        n6["Grundstück Identität"]
        n7["Einheit Struktur"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Teilung Erklärung"]
        n9["Dokument: aktueller Grundbuchauszug"]
        n10["Dokument: Pläne Bescheinigung"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: GNotKG-Kostenweg"]
        n12["Entscheidung: Sonderfall Nutzung Rechte"]
        n13["Entscheidung: Nutzung Fall"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: GNotKG-Kostenprüfung"]
        n15["Prüfgate: Grundbuch Register Umsetzung"]
        n16["Prüfgate: Plan Bescheinigung Prüfung"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n18["Nachweis: Plan Paket"]
        n19["Nachweis: Einheit Register Nachverfolgung"]
    end
    n1 -->|informiert| n11
    n11 -->|blockiert bis vollständig| n14
    n14 -->|belegt durch| n17
    n2 -->|erfordert| n15
    n5 -->|blockiert bis geprüft| n16
    n7 -->|füllt| n8
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
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)
- [https://www.gesetze-im-internet.de/woeigg/__8.html](https://www.gesetze-im-internet.de/woeigg/__8.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
