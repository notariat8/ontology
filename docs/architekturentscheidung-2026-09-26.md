# Forschungsstand und Architekturentscheidung (26.09.2026)

## Fragestellung und Urteil

Für ein öffentliches, menschen- und maschinenlesbares Verzeichnis notarieller **Vorgangsarten** ist ein kleines RDF-Vokabular in Turtle plus SKOS-Katalog in GitHub sinnvoll. Die vorgeschlagene Mermaid-Sicht hilft bei Review und Einstieg. Für verbindliche Prozesslogik ist sie ungeeignet; NaC nutzt dafür bereits BPMN 2.0. SHACL Core ist die geeignete spätere Prüfschicht für Katalogdaten. Eine große OWL-Axiomatik, ein Graphserver oder ein zweiter Workflow-Editor sind jetzt nicht begründet.

**Entscheidung:** Dieses Repository wird ein eigenständiger, versionierter *Typenkatalog und Fachwortschatz*. NaC bleibt vorerst führend für vorhandene `BusinessCaseTypeId`-Werte, usecase-lokale Knowledge Graphs und BPMN-Prozesse. Ob der Katalog später selbst führend werden soll, ist eine bewusste, noch offene Migration mit NaC-Änderung, nicht eine implizite Folge dieses Repositories.

## Verifizierter Ist-Stand in NaC

Lokaler NaC-Checkout am 26.09.2026: Commit `d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b` auf `codex/748-bff-request-log-triage`; der Checkout enthält fremde, uncommittete Dateien und wurde nur gelesen. Dieser Befund ist ein **lokaler Snapshot**, kein Live-Beleg für `origin/main`.

| NaC-Quelle | Befund | Konsequenz |
| --- | --- | --- |
| [`AGENTS.md`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/AGENTS.md), Abschnitt „Fachliche Prozessmodelle“ | BPMN 2.0 ist `first`; `bpmn-js` ist als Editor geplant. | Hier keine konkurrierenden Ablaufdiagramme als Prozessquelle pflegen. |
| [`bpmn/README.md`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/bpmn/README.md) | BPMN-Dateien sind fachliche Prozessquelle; Mermaid ist nur zusätzliche Übersicht. | Mermaid zeigt Ontologie und Navigation, nicht Gates/Sequenz als Norm. |
| [`usecases/README.md`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/usecases/README.md) | 20 kanonische Usecases, 2 historische Starter-Aliase und ein weiterer Backlog; usecase-lokale KG-Dateien. | Die 20 kanonischen Slugs sind die erste Identitätsmenge. |
| [`workflows/contracts/notarial-process-ontology.contract.json`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/workflows/contracts/notarial-process-ontology.contract.json) | Ein „process ontology contract“ existiert bereits: 20 IDs, Klassen, Phasen, SharePoint-Projektion, Offline-Grenzen. | Terminologie und Identitäten abgleichen; keine parallele Runtime-Wahrheit schaffen. |
| [`docs/de/architecture/notarial-process-ontology-contract.md`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/docs/de/architecture/notarial-process-ontology-contract.md) | Der Usecase-Katalog bleibt führend; `Vorgangsartenregister` ist eine Runtime-Projektion; Ontologie kein Runtime-Store. | Diese neue RDF-Ontologie zunächst als austauschbares Referenzvokabular anbinden. |
| [`docs/de/architecture/notarial-deep-process-candidate-routing.md`](https://github.com/notariat8/NaC/blob/d92b47e0a67b6e5bc2f4387742c84ddfe9d2518b/docs/de/architecture/notarial-deep-process-candidate-routing.md) | Tiefe BPMN-/Ontologie-Modellierung wird selektiv geroutet; nicht alle Fälle gleichzeitig. | Breiter dünner Katalog, tiefe Modellierung nach Priorität. |

**Wichtig:** NaC verwendet „Ontologie“ bereits für einen JSON-basierten Produktmodell- und Projektionsvertrag. Das ist keine Turtle/OWL-Ontologie und macht einen interoperablen RDF-Fachwortschatz nicht überflüssig. Eine zweite, unabhängig gepflegte Liste der 20 IDs wäre dagegen redundant. Deshalb brauchen beide Repositories eine automatische Identitäts- und Linkprüfung, bevor ein Release als NaC-kompatibel gilt.

## BPMN, Ontologie, SHACL und Mermaid

| Artefakt | Beantwortet | Autoritative Rolle |
| --- | --- | --- |
| SKOS/RDF/Turtle | Welche Vorgangsart ist gemeint? Welche Fachbegriffe, Identitäten, Quellen und Beziehungen gelten? | Fachwortschatz und Katalog |
| BPMN 2.0 | Welche Aktivitäten, Rollen, Ereignisse, Verzweigungen und Übergaben bilden einen Prozess? | NaC-Prozessquelle |
| SHACL Core | Sind für einen Katalogeintrag Pflichtangaben, Kardinalitäten und Werteformen erfüllt? | Validierungsregel für RDF-Daten |
| Mermaid | Wie sieht die Struktur schnell lesbar aus? | Abgeleitete menschliche Übersicht |

Die [OMG-BPMN-Spezifikation](https://www.omg.org/spec/BPMN/2.0.2/) liefert eine normative Prozessnotation samt maschinenlesbaren Metamodellen. [SKOS](https://www.w3.org/TR/skos-reference/) unterstützt kontrollierte Begriffe mit stabilen IRIs und Labels. [Turtle](https://www.w3.org/TR/turtle/) ist eine gut lesbare RDF-Syntax. [SHACL](https://www.w3.org/TR/shacl/) prüft RDF-Graphen gegen Shapes. Aus diesen unterschiedlichen Semantiken folgt: **Die Ontologie ergänzt BPMN; sie ersetzt es nicht.** Ein OWL-Klassenausdruck definiert beispielsweise keinen verbindlichen Sequenzfluss oder menschlichen Freigabeschritt. Ein BPMN-Gateway definiert umgekehrt keine wiederverwendbare Fachidentität eines Vorgangstyps.

## Alternativen geprüft

| Ansatz | Vorteil | Nachteil im NaC-Kontext | Bewertung |
| --- | --- | --- | --- |
| Nur NaC-BPMN und lokale KG-JSON | Keine zusätzliche Pflegefläche | Kein unabhängiger, interoperabler Fachkatalog; Klassifikation und Begriffsbeziehungen verstreut | Für Abläufe behalten, für Katalog nicht ausreichend |
| Nur Markdown/YAML/JSON-Schema | Einfacher Einstieg und Validierung | Keine standardisierten RDF-IRIs/Linked-Data-Beziehungen; spätere Graphintegration braucht eigene Konvertierung | Gute UI-/Exportformate, nicht kanonisches Vokabular |
| Turtle + SKOS + wenig RDFS/OWL + später SHACL | Stabile Begriffe, Standardformate, Git-Diff, maschinenlesbar | Lernkurve und doppelte IDs ohne Synchronisationsprüfung | **Empfohlen** |
| Vollständige OWL-Ontologie mit Reasoner/Triplestore | Mächtige Inferenz und Abfragen | Hohe Modellierungs- und Betriebsfolgen; keine belegte NaC-Laufzeitanforderung | Aufschieben bis konkrete Abfragefälle vorliegen |
| Mermaid als Hauptmodell | Leicht im GitHub-README sichtbar | Keine RDF-Semantik und keine BPMN-Konformität | Nur Lesesicht |

## Umfang: „alle denkbaren Geschäftsvorfälle“

Das lässt sich am ersten Tag nicht als vollständig behaupten. [§ 20 BNotO](https://www.gesetze-im-internet.de/bnoto/__20.html) nennt neben Beurkundungen und Beglaubigungen weitere Amtstätigkeiten; [BeurkG](https://www.gesetze-im-internet.de/beurkg/) und [NotAktVV](https://www.gesetze-im-internet.de/notaktvv/) regeln weitere Sachverhalte. NaC katalogisiert aktuell 20 kanonische Usecases und nennt weitere Kandidaten. Daraus folgt ein **offener, erweiterbarer Katalog** mit dokumentierten Abdeckungsgrenzen.

Empfohlene Erfassung: erst Amtsgeschäft und Fachbereich trennen, dann konkrete Vorgangsarten; je Art Identität, deutsche Vorzugsbezeichnung, Definition, Rechtsquelle mit Stand, NaC-ID falls vorhanden, Status (`entwurf`, `fachlich geprüft`, `veraltet`) und optional BPMN-Zeiger. Noch nicht fachlich geprüfte Einträge nicht als vollständige Rechtsauskunft präsentieren. Interne Kanzleiprozesse wie Buchhaltung und Onboarding sind gesonderte Betriebsprozesse, keine neue notarielle Amtstätigkeit.

## GitHub-Veröffentlichung und NaC-Anschluss

1. **Git als Review-Quelle:** Turtle und Dokumentation per Pull Request mit fachlichem Review pflegen. Public Repo nur mit abstrakten Typdaten; keine Mandats-, Beteiligten-, Akten- oder Secret-Werte. NaC selbst verbietet Mandatswerte im Repository.
2. **Stabile IRIs:** Die gewählte `https://notariat8.github.io/ontology/id/`-Basis braucht GitHub Pages oder eine andere tatsächlich erreichbare Auflösung. Vor Freigabe der ersten stabilen Version URLs, `text/turtle`-Abruf und Weiterleitungsstrategie testen. GitHub Pages kann statische Dateien hosten, bietet aber keinen SPARQL-Endpunkt und keine serverseitige Inhaltsaushandlung. Diese Fähigkeiten sind derzeit nicht erforderlich. [GitHub-Pages-Dokumentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
3. **Maschinenzugriff:** Versionierte Turtle-Dateien und optional ein statischer Gesamt-Export. Für Menschen README, Begriffsliste und Mermaid; für Maschinen Turtle und später SHACL. Ein statisch generiertes HTML-Portal wäre erst bei wachsendem Katalog sinnvoll.
4. **NaC-Abgleich:** `BusinessCaseTypeId` exakt gleich dem NaC-Slug; 20:20-Abgleich, keine Alias-Duplikate. BPMN-Zeiger nur auf existierende Modelle. Ein NaC-Release sollte eine konkrete Ontologie-Version binden und auf Änderungen prüfen. Erst nach Integration in NaC darf ein Agent den Katalog als Orientierung für Workflows verwenden; verbindliche Gates bleiben in NaC-Policy und BPMN.
5. **SHACL:** Später Shapes für eindeutige NaC-ID, genau ein deutsches `skos:prefLabel`, Fachbereich, definierte Statuswerte und Quellenangaben. Shapes getrennt vom Fachvokabular versionieren; Syntax- und Datenvalidierung in CI. Juristische Richtigkeit oder Freigabe kann SHACL allein nicht beweisen.
6. **Lizenz und Governance:** Vor öffentlichem Release die Lizenz ausdrücklich entscheiden. NaCs CC-BY-4.0 für Dokumentation und AGPL-3.0-or-later für Code gelten nicht automatisch für dieses Repository. [GitHubs Lizenzhinweise](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Offene Entscheidungen

- Wer ist fachlicher Owner und wer prüft neue Rechtsbegriffe und Rechtsquellen?
- Wird dieses Repo dauerhaft ein abgeleiteter, versionierter Katalog oder nach abgestimmter Migration die führende Quelle für `BusinessCaseTypeId`? Bis dahin ist NaC führend.
- Welche Lizenz und welche unveränderliche IRI-/Pages-Domain sollen vor dem ersten öffentlichen Release gelten?
- Welche noch nicht katalogisierten Amtstätigkeiten haben Priorität? Der Anspruch „alle“ braucht eine explizite Abdeckungsmatrix und periodische Rechtsquellenprüfung.

Die externe Quellenlage wurde am 26.09.2026 recherchiert. Rechtsquellen und NaC-Stand müssen vor einer fachlich verbindlichen Veröffentlichung erneut geprüft werden.

## Fortschreibung auf Nutzerentscheidung vom 26.09.2026

Die folgende Entscheidung ersetzt die oben zunächst offenen Punkte für den aktuellen Ausbauschritt:

- **Umfang:** genau die 20 kanonischen NaC-Fälle; keine weitere Aufnahme in diesem Schritt. Die zwei historischen Aliase bleiben ausgeschlossen. Die exakte Menge ist in [`catalog/nac-baseline.json`](../../catalog/nac-baseline.json) festgehalten und wird durch CI geprüft. Der Abgleich mit NaCs GitHub-`main` vom 26.09.2026 (`862c87e1e378657f0066faed1bd36b830be2146d`) ergab dieselben 20 Usecase-Verzeichnisse plus die zwei Aliase.
- **Führende Pflege:** NaC-GitOps führt die kanonischen Usecases und IDs. Dieses Repository übernimmt einen ausdrücklich versionierten Stand. Änderungen gehen durch Issue, Branch, Pull Request, maschinelle Prüfung und Review. Damit wird die parallele Liste nicht stillschweigend zur zweiten Quelle der Wahrheit.
- **Fachlicher Review:** Notarinnen und Notare werden Reviewer für Begriffe, Quellen und fachliche Relationen. Ihre konkreten GitHub-Konten und die technische Review-Pflicht im Branchschutz sind noch einzurichten; ohne benannte Reviewer wird keine bereits erfolgte notarielle Prüfung behauptet.
- **Lizenz:** Wie NaC: fachliches Turtle-Vokabular, Katalog, Dokumentation und Mermaid unter `CC-BY-4.0`; Validatoren und technische Workflows unter `AGPL-3.0-or-later`. Volltexte und Zuordnung stehen in [`LICENSES/`](../../LICENSES/README.md), der NaC-Herkunftshinweis in [`NOTICE`](../../NOTICE).
- **Webadresse:** wird später entschieden. Die bisherige Turtle-IRI-Basis ist ein technischer Bezeichner, keine veröffentlichte oder beschlossene Website. Auflösung und Hosting werden jetzt nicht als Voraussetzung behandelt.

Die ursprüngliche Forschungsfrage nach vollständiger Abdeckung bleibt dokumentiert, ist aber **nicht** der Umfang dieser 20-Fälle-Phase. Auch SHACL bleibt ein späterer Ausbauschritt innerhalb dieser festgelegten Menge.

## Korrektur des Lieferumfangs nach Nutzerfeedback

Ein bloßer 20er-Typenindex und eine Gesamtgrafik erfüllten die ursprüngliche Bitte um eine **hier pflegbare Ontologie** nicht. Für jeden der 20 kanonischen NaC-Fälle liegt deshalb nun unter [`cases/`](../../cases/README.md) ein eigenes Turtle-Modul mit Angabenfragen, Dokumenttypen, Entscheidungspunkten, Prüfgates, Nachweistypen, acht gerichteten Beziehungstypen und den in NaC genannten Rechtsquellen. Die Mermaid-Sicht je Fall wird aus diesem Turtle-Modul erzeugt; Änderungen erfolgen in Turtle. Das gemeinsame Vokabular steht in [`ontology/core.ttl`](../../ontology/core.ttl).

Die Module wurden aus NaCs usecase-lokalen Vorlagengraphen beim festgehaltenen Commit `862c87e1e378657f0066faed1bd36b830be2146d` initialisiert und auf Knoten, Labels, Kanten und Quellverweise abgeglichen. Das ist eine **inhaltstreue Übernahme eines noch offenen NaC-Modellierungsstands**, keine eigenständige notarielle Validierung und keine Aussage über reale Akten. BPMN bleibt für zeitliche Abläufe und Ausführung führend.
