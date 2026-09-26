# Erbausschlagung: Übernahme des Ablaufplans

Der von der Nutzerin bzw. dem Nutzer bereitgestellte Ablaufplan
`Ablaufplan_Erbausschlagung_Notarbuero.docx` wird für dieses Projekt als
NaC-Standardvorlage behandelt. Die textgetreue, lesbare Fassung steht in
[`ablaufplan.md`](../../sources/erbausschlagung/ablaufplan.md). Ihr SHA-256
ist `8bc96ab1a3a456910a444507e124647b026e873dd904486435e6d5fb89a6b33b`.
Die Übernahme des Textes in dieses Repository unter CC-BY-4.0 wurde vom
Auftraggeber am 26.09.2026 ausdrücklich gestattet. Die Word-Datei selbst
bleibt wegen eingebetteter Bild- und Metadaten außerhalb des Repositories.

## Fachlicher Status und Zuständigkeit

- **Status:** Entwurf aus der bereitgestellten Vorlage; keine notarielle
  Freigabe der Ontologie oder eine Bestätigung aktueller Rechtslage.
- **Fachliche Prüfung:** Notarin Hannah-Silvia Heise,
  `h.heise@christmann-heise.de`. Eine öffentliche GitHub-Zuordnung zu dieser
  Adresse ließ sich nicht belegen; der GitHub-Name wird nachgereicht.
- **Technische Pflege:** NaC via Branch, Pull Request und GitOps.
- **NaC-Ausgangsstand:**
  [`862c87e1e378657f0066faed1bd36b830be2146d`](https://github.com/notariat8/NaC/tree/862c87e1e378657f0066faed1bd36b830be2146d/usecases/erbausschlagung).

## Modellgrenze

Der Ablaufplan hat acht Übersichtsphasen und neun Detailkapitel. Die
Ontologie übernimmt dessen Fragen, Dokumentarten, Entscheidungen,
Prüfgates und Nachweisarten. Die zwei Wege **mit** und **ohne**
Vollzugsauftrag sind als fachliche Entscheidung mit unterschiedlichen
Nachweisen modelliert. Der zeitliche Kontrollfluss bleibt im NaC-BPMN;
dessen gegenwärtig lineares Modell bildet diese Verzweigung noch nicht ab.
Ein NaC-Änderungsvorschlag dafür ist nötig und darf nicht durch das
Mermaid-Fachdiagramm vorgetäuscht werden.

Die textgetreue Vorlage bleibt daneben notwendig: Sie enthält Rollen,
Eskalationsanweisungen, Fristenorganisation und Arbeitshinweise, die in
einem Fachgraphen nicht vollständig oder sinnvoll als RDF-Typen
ausgedrückt werden. In einem konkreten Mandat gelten stets die aktuelle
Rechtslage, der tatsächliche Auftrag und die notarielle Einzelfallprüfung.

## Abdeckung

| Detailkapitel | Fachgraph-Schwerpunkt | Ausführliche Anweisung |
| --- | --- | --- |
| I Mandatsannahme | Auftragsumfang, Konflikt, Datenschutz, Fristenakte | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#i-mandatsannahme-und-sofortanlage) |
| II Kernaufnahme | Erbfall, Berufung, Kenntnis, Ausland, Vorhandlungen | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#ii-kernaufnahme-des-sachverhalts) |
| III Vorprüfung | Annahme, mehrere Gründe, Nachrücken, Sonderfälle | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#iii-materielle-vorprüfung-und-risikoeinstufung) |
| IV Frist/Zuständigkeit | Frist, Belege, Gericht, Vier-Augen-Kontrolle | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#iv-fristmanagement-und-zuständigkeit) |
| V Form/Belehrung | Formwahl, Entwurf, Belehrung | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#v-form-entwurf-und-notarielle-belehrung) |
| VI Vertretung | Vollmacht, Minderjährige, Genehmigung | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#vi-vertretung-minderjährige-und-genehmigung) |
| VII Vollzug | Beauftragter Vollzug oder Aushändigung | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#vii-vollzug-zwei-klar-getrennte-wege) |
| VIII Nachbearbeitung | Gerichtseingang, Nachfragen, Mandanteninfo | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#viii-gerichtlicher-umgang-und-nachbearbeitung) |
| IX Abschluss | Vollständigkeit, Aufbewahrung, Kosten | [Vorlage](../../sources/erbausschlagung/ablaufplan.md#ix-aktenabschluss-und-aufbewahrung) |

## Synthetische Beispiele

Die [Justiz-Services](https://www.service.justiz.de/erbausschlagung)
beschreiben allgemein verständliche Fallkonstellationen zu vorheriger
Annahme, Kindern und Fristen. Daraus lassen sich **synthetische
Prüfszenarien**, aber keine realen Akten, ableiten. Sie stehen in
[`synthetische-szenarien.md`](synthetische-szenarien.md). Die Szenarien
illustrieren offene Prüffragen, keine rechtliche Entscheidung.

## Quellenprüfung vor Freigabe

Die Vorlage nennt Rechtsprechung und Literatur. Diese Nachweise wurden
beim Import **nicht vollständig im Volltext geprüft**. H. Heise soll
besonders die Formulierung zum notariellen Niederschriftweg, die
Genehmigung/Fristhemmung bei Minderjährigen, internationale Sachverhalte,
Versandwege und die Urteile prüfen. Geprüfte Primärnormen:
[§ 1944 BGB](https://www.gesetze-im-internet.de/bgb/__1944.html),
[§ 1945 BGB](https://www.gesetze-im-internet.de/bgb/__1945.html),
[§ 1949 BGB](https://www.gesetze-im-internet.de/bgb/__1949.html),
[§ 1953 BGB](https://www.gesetze-im-internet.de/bgb/__1953.html),
[§ 343 FamFG](https://www.gesetze-im-internet.de/famfg/__343.html),
[§ 344 FamFG](https://www.gesetze-im-internet.de/famfg/__344.html).
