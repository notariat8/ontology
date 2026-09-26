# Erbausschlagung

Erbausschlagungserklärung gegenüber dem Nachlassgericht mit Frist, Identität, Vertretung, Minderjährigen- oder Betreuungsbezug und Zustellnachweis.

[Turtle-Quelle](ontology.ttl) · [NaC-Vorlagengraph](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/usecases/erbausschlagung/knowledge-graph.graph.json) · [NaC-BPMN](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/bpmn/usecases/erbausschlagung.bpmn)

[Vollständiger Ablaufplan](../../sources/erbausschlagung/ablaufplan.md) · [Übernahme und Prüfpunkte](../../docs/erbausschlagung/import-notes.md) · [Synthetische Prüfszenarien](../../docs/erbausschlagung/synthetische-szenarien.md)

Ausgangspunkt dieses Fachgraphen sind **Vorlagenbegriffe** aus NaC; lokale Ergänzungen tragen eine `local.`-Kennung. `open` in der NaC-Quelle bedeutet eine offene Modellierungsfrage, keinen Status einer echten Akte. Die Pfeile zeigen fachliche Beziehungen; den zeitlichen Ablauf beschreibt das verlinkte BPMN-Modell. Eine notarielle Prüfung dieser Übernahme steht noch aus.

## Fallgraph

```mermaid
flowchart LR
    subgraph g1["Angabenfragen"]
        n1["Geschäftswert für GNotKG-Kostenprüfung"]
        n2["Frist Status"]
        n3["Erblasser Identität"]
        n4["Zustellung Route"]
        n5["Erbenstellung Grundlage"]
        n6["Aufenthalt und Auslandswohnsitz des Erblassers"]
        n7["Kinder und weitere mögliche Nachberufene"]
        n8["Mehrere Berufungsgründe und Vor- oder Nacherbschaft"]
        n9["Internationale Bezüge"]
        n10["Kenntnis von Erbfall und Berufungsgrund"]
        n11["Auftragsumfang und Vollzugsleistungen"]
        n12["Vorhandlungen am Nachlass"]
        n13["Geschäftsfähigkeit und Aufenthalt der ausschlagenden Person"]
        n14["Ausschlagende Person Identität"]
        n15["Representation Minderjährige"]
    end
    subgraph g2["Dokumenttypen"]
        n16["Dokument: Genehmigung Nachweis"]
        n17["Dokument: Sterbefall oder Gericht Referenz"]
        n18["Dokument: Ausschlagung Erklärung"]
        n19["Fristenblatt und Wiedervorlagen"]
        n20["Entwurf der Ausschlagungserklärung"]
        n21["Schriftlicher Vollzugsauftrag"]
        n22["Schriftlicher Hinweis bei Selbsteinreichung"]
        n23["Erhebungsbogen und Dokumentenliste"]
        n24["Öffentlich beglaubigte Vollmacht oder notarielle Bescheinigung"]
    end
    subgraph g3["Entscheidungen"]
        n25["Entscheidung: Genehmigung erforderlich"]
        n26["Entscheidung: Frist Risiko"]
        n27["Entscheidung: GNotKG-Kostenweg"]
        n28["Mögliche Annahme der Erbschaft"]
        n29["Abschlussmitteilung beauftragt?"]
        n30["Empfangendes Nachlassgericht"]
        n31["Sechs Wochen oder sechs Monate"]
        n32["Vollzugsauftrag an Notar erteilt?"]
        n33["Nachkontrolle ohne Vollzugsauftrag vereinbart?"]
        n34["Form der Ausschlagungserklärung"]
        n35["Genehmigungsbedarf für vertretene Person"]
        n36["Nachrücken und Folgeerklärungen"]
    end
    subgraph g4["Prüfgates"]
        n37["Prüfgate: Gericht Zustellung"]
        n38["Prüfgate: Frist Prüfung"]
        n39["Prüfgate: GNotKG-Kostenprüfung"]
        n40["Genehmigungsantrag und Fristwirkung"]
        n41["Vier-Augen-Fristkontrolle"]
        n42["Versandform und gerichtliche Vorgaben"]
        n43["Vollständigkeits- und Endkontrolle"]
        n44["Notarielle Prüfung von Sonderrisiken"]
        n45["Notarielle Belehrung und Willensklärung"]
        n46["Vertretungsmacht und Interessenkollision"]
        n47["Gerichtseingang überwachen"]
        n48["Eingangsbestätigung richtig einordnen"]
        n49["Aufbewahrung und Urkundensammlung"]
        n50["Kontakt zu Nachberufenen begrenzen"]
        n51["Konflikt- und Beteiligtenprüfung"]
        n52["Datensparsame Aktenanlage"]
    end
    subgraph g5["Nachweistypen"]
        n53["Nachweis: Frist Prüfung"]
        n54["Nachweis: Zustellung Nachverfolgung"]
        n55["Nachweis: GNotKG-Kostenentwurf und Kostenprüfung"]
        n56["Individueller Genehmigungs- und Fristnachweis"]
        n57["Abschlussvermerk"]
        n58["Kostenrechnung und Kostenprüfung"]
        n59["Gerichtliche Korrespondenz und Nachfragen"]
        n60["Zuständigkeitsvermerk"]
        n61["Versand- und Gerichtseingangsnachweis"]
        n62["Belehrungs- und Entscheidungsvermerk"]
        n63["Quittierte Aushändigung und Hinweisvermerk"]
        n64["Risiko- und Eskalationsvermerk"]
    end
    n1 -->|informiert| n27
    n10 -->|füllt| n19
    n11 -->|informiert| n29
    n11 -->|erfordert Entscheidung| n32
    n11 -->|erfordert| n51
    n11 -->|erfordert| n52
    n12 -->|erfordert Entscheidung| n28
    n13 -->|informiert| n31
    n13 -->|erfordert Entscheidung| n35
    n14 -->|informiert| n23
    n15 -->|erfordert Entscheidung| n25
    n15 -->|informiert| n35
    n16 -->|belegt durch| n56
    n18 -->|erfordert| n42
    n2 -->|informiert| n31
    n2 -->|blockiert bis geprüft| n38
    n20 -->|erfordert| n45
    n21 -->|erfordert| n42
    n22 -->|erfordert Entscheidung| n33
    n22 -->|belegt durch| n63
    n24 -->|erfordert| n46
    n27 -->|blockiert bis vollständig| n39
    n28 -->|erfordert| n44
    n29 -->|erfordert| n50
    n3 -->|informiert| n23
    n30 -->|belegt durch| n60
    n31 -->|erfordert| n41
    n32 -->|bestimmt| n21
    n32 -->|bestimmt| n22
    n34 -->|bestimmt| n20
    n35 -->|erfordert| n40
    n36 -->|informiert| n7
    n37 -->|erfordert| n48
    n39 -->|belegt durch| n55
    n4 -->|informiert| n32
    n4 -->|belegt durch| n54
    n40 -->|belegt durch| n56
    n41 -->|belegt durch| n53
    n42 -->|erfordert| n47
    n43 -->|belegt durch| n57
    n44 -->|belegt durch| n64
    n45 -->|belegt durch| n62
    n47 -->|belegt durch| n61
    n48 -->|belegt durch| n59
    n49 -->|informiert| n57
    n5 -->|informiert| n36
    n58 -->|informiert| n43
    n6 -->|informiert| n30
    n6 -->|informiert| n31
    n61 -->|erfordert| n48
    n8 -->|erfordert| n44
    classDef info fill:#e8f2ff,stroke:#4b77a7,color:#111;
    classDef doc fill:#eef8ee,stroke:#4d8a55,color:#111;
    classDef decision fill:#fff4df,stroke:#ac7a21,color:#111;
    classDef gate fill:#fdebec,stroke:#b45c64,color:#111;
    classDef evidence fill:#f3edff,stroke:#8060aa,color:#111;
    class n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13,n14,n15 info;
    class n16,n17,n18,n19,n20,n21,n22,n23,n24 doc;
    class n25,n26,n27,n28,n29,n30,n31,n32,n33,n34,n35,n36 decision;
    class n37,n38,n39,n40,n41,n42,n43,n44,n45,n46,n47,n48,n49,n50,n51,n52 gate;
    class n53,n54,n55,n56,n57,n58,n59,n60,n61,n62,n63,n64 evidence;
```

## Enthaltene Bausteine

| Gruppe | Anzahl |
| --- | ---: |
| Angabenfragen | 15 |
| Dokumenttypen | 9 |
| Entscheidungen | 12 |
| Prüfgates | 16 |
| Nachweistypen | 12 |

## Ergänzungen aus der Fachvorlage

Diese Einträge sind ein fachlicher Entwurf. Die Kapitelangabe verweist auf den vollständigen Ablaufplan; Entscheidungen und Prüfgates ersetzen keine Einzelfallprüfung.

| Kapitel | Baustein | Prüfgegenstand oder mögliche Optionen |
| --- | --- | --- |
| I | Auftragsumfang und Vollzugsleistungen | Auftrag getrennt nach Vorbereitung, Beglaubigung oder Beurkundung, Fristprüfung, Zuständigkeit, Genehmigungsverfahren, Versand, Empfangsbestätigung und Abschlussinformation klären. Steuerliche oder wirtschaftliche Gestaltung nur bei eigenem Auftrag. |
| I | Datensparsame Aktenanlage | Siehe Kapitel I des vollständigen Ablaufplans. |
| I | Fristenblatt und Wiedervorlagen | Fristenakte sofort anlegen, auch wenn Belege fehlen. Fristbeginn, vorläufiges Fristende, interne Vorfristen, Eingangskontrolle und Abschluss mit Verantwortlichkeit und Wiedervorlage erfassen. |
| I | Konflikt- und Beteiligtenprüfung | Siehe Kapitel I des vollständigen Ablaufplans. |
| II | Aufenthalt und Auslandswohnsitz des Erblassers | Welche Angaben und Nachweise sind für Aufenthalt und Auslandswohnsitz des Erblassers erforderlich? |
| II | Erhebungsbogen und Dokumentenliste | Siehe Kapitel II des vollständigen Ablaufplans. |
| II | Geschäftsfähigkeit und Aufenthalt der ausschlagenden Person | Welche Angaben und Nachweise sind für Geschäftsfähigkeit und Aufenthalt der ausschlagenden Person erforderlich? |
| II | Internationale Bezüge | Welche Angaben und Nachweise sind für Internationale Bezüge erforderlich? |
| II | Kenntnis von Erbfall und Berufungsgrund | Kenntnis vom Erbfall und vom Berufungsgrund getrennt erheben und durch Gerichtsschreiben oder nachvollziehbaren Aktenvermerk belegen. |
| II | Kinder und weitere mögliche Nachberufene | Welche Angaben und Nachweise sind für Kinder und weitere mögliche Nachberufene erforderlich? |
| II | Mehrere Berufungsgründe und Vor- oder Nacherbschaft | Welche Angaben und Nachweise sind für Mehrere Berufungsgründe und Vor- oder Nacherbschaft erforderlich? |
| II | Vorhandlungen am Nachlass | Besitznahme, Verfügung, Zahlung oder Geltendmachung von Nachlassverbindlichkeiten, Erbscheinsantrag und Kommunikation mit Banken oder Behörden als mögliche Annahmehandlungen erfassen. |
| III | Mögliche Annahme der Erbschaft | needs-notarial-review, none-indicated, possible |
| III | Nachrücken und Folgeerklärungen | needs-review, no, yes |
| III | Notarielle Prüfung von Sonderrisiken | Siehe Kapitel III des vollständigen Ablaufplans. |
| III | Risiko- und Eskalationsvermerk | Siehe Kapitel III des vollständigen Ablaufplans. |
| IV | Empfangendes Nachlassgericht | Gericht am letzten gewöhnlichen Aufenthalt des Erblassers und die Empfangsmöglichkeit am gewöhnlichen Aufenthalt des Ausschlagenden prüfen; Zweifel sofort eskalieren. |
| IV | Sechs Wochen oder sechs Monate | Grundsätzlich sechs Wochen prüfen; sechs Monate bei gesetzlich relevantem Auslandsbezug. Bei Verfügung von Todes wegen den besonderen Fristbeginn nach Bekanntgabe durch das Gericht beachten. |
| IV | Vier-Augen-Fristkontrolle | Kenntnisbelege, Fristbeginn und Fristende, interne Vorfrist sowie Versand mindestens im Vier-Augen-Prinzip prüfen. Maßgeblich ist der Gerichtszugang. |
| IV | Zuständigkeitsvermerk | Siehe Kapitel IV des vollständigen Ablaufplans. |
| V | Belehrungs- und Entscheidungsvermerk | Siehe Kapitel V des vollständigen Ablaufplans. |
| V | Entwurf der Ausschlagungserklärung | Siehe Kapitel V des vollständigen Ablaufplans. |
| V | Form der Ausschlagungserklärung | court-record, notarial-record-review, publicly-certified |
| V | Notarielle Belehrung und Willensklärung | Willen und Beweggründe klären; Folgen, Nachrücken, mehrere Berufungsgründe, Frist, Gerichtszugang und Grenzen einer gerichtlichen Eingangsbestätigung erläutern. |
| VI | Genehmigungsantrag und Fristwirkung | Vertretungsmacht, gemeinsamen Willen der Sorgeberechtigten, Genehmigungsantrag, Antragseingang, mögliche Fristwirkung und spätere Vorlage der Genehmigung prüfen. |
| VI | Genehmigungsbedarf für vertretene Person | Bei minderjährigen, betreuten oder sonst vertretenen Personen Genehmigungserfordernis und mögliche Ausnahme für nachrückende Kinder einzelfallbezogen prüfen; keine pauschale Aussage. |
| VI | Individueller Genehmigungs- und Fristnachweis | Siehe Kapitel VI des vollständigen Ablaufplans. |
| VI | Vertretungsmacht und Interessenkollision | Siehe Kapitel VI des vollständigen Ablaufplans. |
| VI | Öffentlich beglaubigte Vollmacht oder notarielle Bescheinigung | Siehe Kapitel VI des vollständigen Ablaufplans. |
| VII | Gerichtseingang überwachen | Bei beauftragtem Vollzug bis zum nachgewiesenen Gerichtseingang täglich kontrollieren, bei fehlender Bestätigung nachfassen und bei Risiko sofort eskalieren. |
| VII | Nachkontrolle ohne Vollzugsauftrag vereinbart? | agreed, not-agreed |
| VII | Quittierte Aushändigung und Hinweisvermerk | Quittierte Übergabe, Datum, übergebene Unterlagen und Hinweis auf Gerichtszugang als Nachweisart dokumentieren. |
| VII | Schriftlicher Hinweis bei Selbsteinreichung | Bei Selbsteinreichung schriftlich auf eigene Verantwortung, unverzügliche Einreichung und maßgeblichen Gerichtszugang hinweisen; keine Wirksamkeitszusage. |
| VII | Schriftlicher Vollzugsauftrag | Siehe Kapitel VII des vollständigen Ablaufplans. |
| VII | Versand- und Gerichtseingangsnachweis | Siehe Kapitel VII des vollständigen Ablaufplans. |
| VII | Versandform und gerichtliche Vorgaben | Je nach Urkundenform Original, Ausfertigung oder erforderliche Abschrift und aktuelle gerichtliche Vorgaben zur Übermittlung prüfen. |
| VII | Vollzugsauftrag an Notar erteilt? | Zwei alternative Wege: Notariat übernimmt Übermittlung und Zugangskontrolle oder Mandantschaft reicht selbst beim Gericht ein. Den Auftrag schriftlich festhalten. |
| VIII | Abschlussmitteilung beauftragt? | commissioned, not-commissioned |
| VIII | Eingangsbestätigung richtig einordnen | Gerichtliche Eingangsbestätigung nur als Nachweis des Eingangs behandeln; sie ist keine abschließende Bestätigung materieller oder formeller Wirksamkeit. |
| VIII | Gerichtliche Korrespondenz und Nachfragen | Siehe Kapitel VIII des vollständigen Ablaufplans. |
| VIII | Kontakt zu Nachberufenen begrenzen | Siehe Kapitel VIII des vollständigen Ablaufplans. |
| IX | Abschlussvermerk | Siehe Kapitel IX des vollständigen Ablaufplans. |
| IX | Aufbewahrung und Urkundensammlung | Siehe Kapitel IX des vollständigen Ablaufplans. |
| IX | Kostenrechnung und Kostenprüfung | Siehe Kapitel IX des vollständigen Ablaufplans. |
| IX | Vollständigkeits- und Endkontrolle | Urkunde, Identität, Fristenblatt, Vollmacht, Genehmigung, Versand, Zugang, Kommunikation, Kosten und offene Risiken vor Abschluss prüfen. |

## In NaC genannte Rechtsquellen

- [https://www.gesetze-im-internet.de/beurkg/](https://www.gesetze-im-internet.de/beurkg/)
- [https://www.gesetze-im-internet.de/bgb/__1945.html](https://www.gesetze-im-internet.de/bgb/__1945.html)

Diese Links dokumentieren die Quellen des NaC-Vorlagengraphen; sie belegen keine erneute rechtliche Prüfung.

## Pflege

Fachbegriffe und Beziehungen mit dem [Browser-Editor](../../README.md#im-browser-bearbeiten) oder in [ontology.ttl](ontology.ttl) ändern. Der Editor erzeugt diese Seite beim Speichern. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen und beide Änderungen gemeinsam reviewen.
