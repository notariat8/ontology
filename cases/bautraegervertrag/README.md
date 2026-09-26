# Bauträgervertrag

Kauf einer Immobilie oder Einheit vom Bauträger mit Bauverpflichtungen, Ratenplan, Fertigstellungsstand, Sicherheiten und Verbraucherschutz-Gates.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/bautraegervertrag/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/bautraegervertrag.bpmn)

Dieser Fachgraph beschreibt **Vorlagenbegriffe** aus NaC. `open` in der Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen aus dem NaC-Graphen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Käufer Identität"]
        n2["Bauleistung Spezifikation"]
        n3["Geschäftswert für GNotKG-Kostenprüfung"]
        n4["Mängel acceptance"]
        n5["Bauträger Identität"]
        n6["Ratenplan Plan"]
        n7["Objekt Identität"]
    end
    subgraph g2["Dokumenttypen"]
        n8["Dokument: Bauträger Vertrag Entwurf"]
        n9["Dokument: Grundbuch Register Stand"]
        n10["Dokument: Spezifikation Paket"]
    end
    subgraph g3["Entscheidungen"]
        n11["Entscheidung: GNotKG-Kostenweg"]
        n12["Entscheidung: Objekt Stand"]
        n13["Entscheidung: Zahlung Modell"]
    end
    subgraph g4["Prüfgates"]
        n14["Prüfgate: Verbraucher-Entwurfsfrist"]
        n15["Prüfgate: GNotKG-Kostenprüfung"]
        n16["Prüfgate: Ratenplan Prüfung"]
    end
    subgraph g5["Nachweistypen"]
        n17["Nachweis: Bauleistung Paket"]
        n18["Nachweis: Verbraucher Freigabe"]
        n19["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
    end
    n1 -->|erfordert| n14
    n11 -->|blockiert bis vollständig| n15
    n15 -->|belegt durch| n19
    n2 -->|belegt durch| n10
    n3 -->|informiert| n11
    n6 -->|blockiert bis geprüft| n16
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

- [https://www.gesetze-im-internet.de/abschlagsv/](https://www.gesetze-im-internet.de/abschlagsv/)
- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/bgb/__311b.html](https://www.gesetze-im-internet.de/bgb/__311b.html)
- [https://www.gesetze-im-internet.de/bgb/__650u.html](https://www.gesetze-im-internet.de/bgb/__650u.html)
- [https://www.gesetze-im-internet.de/gbo/](https://www.gesetze-im-internet.de/gbo/)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen in [ontology.ttl](ontology.ttl) ändern. Danach `python scripts/render_case_docs.py --write` ausführen und den Git-Diff von Turtle und dieser Seite gemeinsam reviewen.
