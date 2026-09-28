# Produktstand des NaC-Ontologie-Editors

Stand: 28.09.2026. Bezugsrahmen sind ausschließlich die 20 Vorgangsarten in [`catalog/nac-baseline.json`](../catalog/nac-baseline.json). Die Oberfläche bearbeitet fachliche **Vorlagen**; reale Akten und laufende Vorgänge gehören nicht in dieses Repository.

## Was die Oberfläche bereits kann

| Aufgabe | Umgesetzter Weg |
| --- | --- |
| Einen Fall verstehen | Lesbare Fallübersicht, Quellen, direkter Verweis auf das NaC-BPMN-Prozessmodell und aus Turtle erzeugte Mermaid-Seite. |
| Einen Baustein finden | Suche im Fall und über alle 20 Fälle; ein Treffer öffnet unmittelbar den betreffenden Baustein. Der gemeinsame Suchstand ist an einen Git-Commit gebunden. |
| Fachliche Inhalte pflegen | Strukturierte Felder für Fragen, Dokumenttypen, Entscheidungen, Prüfschritte, Nachweistypen und ihre Beziehungen. Vor dem Speichern erscheint eine fachliche Änderungsvorschau. Turtle bleibt Pflegequelle. |
| Gemeinsame Begriffe pflegen | Klassen und Eigenschaften bearbeiten; die technische Verwendung in den 20 Fällen sehen und zu betroffenen Fällen springen. |
| Änderungen prüfen | Getrennte Git-Branches und Pull Requests, Quellenstand und Begründung, fachlicher Prüfkorb, begründete Freigabe durch ein anderes eingetragenes Notarkonto auf dem geprüften Commit. |

Die [Palantir-Dokumentation zum Ontology Manager](https://www.palantir.com/docs/foundry/ontology-manager/overview) beschreibt darüber hinaus die Pflege von Objekttypen, Eigenschaften, Aktionen und Datenanbindungen. Ihre [Usage-Ansicht](https://www.palantir.com/docs/foundry/ontology-manager/view-usage) bezieht auch tatsächliche Lese- und Schreibzugriffe von Anwendungen ein. Unsere Verwendungsanzeige zählt dagegen RDF-Aussagen in den 20 Fallvorlagen; sie sagt nichts über laufende Akten oder Anwendungen aus. Palantir bietet außerdem eine [integrierte Änderungshistorie und Wiederherstellung](https://www.palantir.com/docs/foundry/ontology-manager/restore-changes). Bei NaC liegt die dauerhafte Historie derzeit in GitHub; eine fachliche Wiederherstellungsansicht im Editor fehlt.

Das Ziel ist deshalb ein **vollwertiger Editor für den abgegrenzten NaC-Fachkatalog**, keine Kopie der gesamten Foundry-Plattform. BPMN bleibt in NaC für Abläufe zuständig. SHACL ist eine spätere Prüfschicht und wird erst nach einer konkreten Shapes-Entscheidung bearbeitet.

## Offene Produktabnahme

1. Eine reale GitHub App auf dem Zielrepository installieren, die drei Rollen konfigurieren und den Anmelde-, Bearbeitungs- und Prüfweg mit zwei unterschiedlichen Konten gegen GitHub durchspielen.
2. Einen HTTPS-Host mit Geheimnisspeicher und genau einer Editor-Instanz bereitstellen; die Webadresse kann später festgelegt werden. Der technische Vertrag steht in [`editor-hosting.md`](editor-hosting.md).
3. Notarielle Fachpersonen an ausgewählten Aufgaben testen lassen: Fall finden, Baustein erklären und ändern, Quellenstand angeben, Änderung prüfen. Die heutige technische Prüfung belegt keine fachliche Verständlichkeit oder Freigabe.
4. Den verbindlichen Merge-Schutz klären: Das private Repository kann mit dem aktuellen GitHub-Tarif keine erforderliche Schutzregel erzwingen; siehe [Issue #7](https://github.com/notariat8/ontology/issues/7). Die fachlich geprüften Anzeigenamen technischer NaC-Werte stehen in [Issue #8](https://github.com/notariat8/ontology/issues/8).

**Token-Aufwand als Schätzung, nicht als gemessener Verbrauch:** Für echte GitHub-App-Integration, Bereitstellung, Sicherheits- und Nutzertests samt anschließenden Korrekturen sind grob **20.000–40.000 Modell-Token** weiterer Entwicklungsarbeit plausibel. Die Spanne enthält keine fachliche Review-Arbeit der Notare und keine zusätzliche SHACL-Implementierung. Ein genauer Ist-Verbrauch lässt sich aus diesem Repository oder der Editor-Oberfläche nicht ablesen. Externe Konten, Host und GitHub-Schutzregel können durch mehr Modell-Token nicht ersetzt werden.
