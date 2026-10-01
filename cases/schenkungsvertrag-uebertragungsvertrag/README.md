# Schenkungsvertrag / Übertragungsvertrag

Schenkung oder Übertragungsvertrag, häufig innerhalb der Familie und oft grundstücksbezogen, mit Vorbehaltsrechten, Rückforderung, Pflegepflichten, Steuer- und Grundbuchvollzug.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/schenkungsvertrag-uebertragungsvertrag/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/schenkungsvertrag-uebertragungsvertrag.bpmn)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Vermögen Identität"]
        n2["Zustimmungen Genehmigungen"]
        n3["Gegenleistung Pflichten"]
        n4["Geschäftswert für GNotKG-Kostenprüfung"]
        n5["Vorbehaltsrechte Rechte"]
        n6["Rückforderungsrechte Rechte"]
        n7["Steuer Familie Prüfflaggen"]
        n8["Erwerber Identität"]
        n9["Übertragender Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n10["Dokument: Genehmigungen"]
        n11["Dokument: aktueller Grundbuchauszug"]
        n12["Dokument: Übertragung Entwurf"]
    end
    subgraph g3["Entscheidungen"]
        n13["Entscheidung: GNotKG-Kostenweg"]
        n14["Entscheidung: Vorbehaltsrechte Rechte"]
        n15["Entscheidung: Übertragung Art"]
    end
    subgraph g4["Prüfgates"]
        n16["Prüfgate: Vermögen Prüfung"]
        n17["Prüfgate: Familie Steuer Prüfung"]
        n18["Prüfgate: GNotKG-Kostenprüfung"]
    end
    subgraph g5["Nachweistypen"]
        n19["Nachweis: Vollzug Nachverfolgung"]
        n20["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n21["Nachweis: Prüfung Nachverfolgung"]
    end
    n1 -->|blockiert bis geprüft| n16
    n13 -->|blockiert bis vollständig| n18
    n18 -->|belegt durch| n20
    n4 -->|informiert| n13
    n5 -->|erfordert Entscheidung| n14
    n7 -->|blockiert bis geprüft| n17
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
- [https://www.gesetze-im-internet.de/bgb/__311b.html](https://www.gesetze-im-internet.de/bgb/__311b.html)
- [https://www.gesetze-im-internet.de/bgb/__518.html](https://www.gesetze-im-internet.de/bgb/__518.html)
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
