# Regeln für die NaC-Fallontologie

- Dieses Projekt enthält ausschließlich Notar-Fachmodelle, Katalog, Quellen, fachliche Dokumentation und zugehörige Datenvalidatoren/Generatoren. SaaS-Editor, Oberfläche, Anmeldung und Hosting werden in `ontologie8/editor8` gepflegt. Keinen Editor-Code aus alten Zweigen wieder hier einführen.
- Beauftragte Arbeit über Repositorygrenzen ist zulässig: Datenvertrag und Git-Pull-Requests verbinden die Projekte. Ziel und Git-Remote vor jedem Zugriff verifizieren; Software und Fachmodelle getrennt prüfen und liefern. Andere Codex-Chats nur bei ausdrücklicher Nutzerbeauftragung anschreiben.

- Dieses Repository pflegt genau die 20 kanonischen NaC-Vorgangsarten aus [catalog/nac-baseline.json](catalog/nac-baseline.json). Die zwei historischen Aliase sind keine eigenen Fälle. Eine Erweiterung braucht eine ausdrücklich geänderte Umfangsentscheidung.
- [ontology/core.ttl](ontology/core.ttl) und die 20 `cases/<slug>/ontology.ttl` sind die fachliche Pflegequelle. Die Mermaid-Seiten werden mit `python scripts/render_case_docs.py --write` aus Turtle erzeugt und nicht isoliert bearbeitet.
- NaCs usecase-lokale Knowledge Graphs sind der dokumentierte Ausgangsstand. Neue Änderungen in dieser Ontologie erfolgen hier über GitOps und dürfen den NaC-Stand nicht stillschweigend umdeuten. Ein NaC-Abgleich benennt immer den konkreten Commit.
- Die Fallmodule enthalten ausschließlich Typen, Fragen, Dokumentarten, Entscheidungen, Gates, Nachweisarten und Beziehungen. Keine realen Aktenwerte, Personen- oder Dokumentinhalte, Secrets oder Laufzeitstatus in Git speichern.
- BPMN in NaC bleibt Quelle für den Prozessablauf. Mermaid visualisiert den Fachgraphen und ist kein BPMN-Ersatz.
- Vor einer **fachlichen Freigabe** von Begriffen, Rechtsquellen und Beziehungen ist eine dokumentierte Prüfung durch eine Notarin oder einen Notar erforderlich. Ein technischer Validator ersetzt diese Prüfung nicht. Ein inhaltstreuer Erstimport aus NaC darf als ausdrücklich ungeprüfter Entwurf gepflegt werden, ohne als fachlich freigegeben zu gelten.
- Änderungen per Branch und Pull Request mit Begründung, Quellenstand und Prüfnachweis pflegen. Vor Abnahme `python scripts/validate_catalog.py`, `python scripts/validate_cases.py` und `python scripts/render_case_docs.py --check` ausführen; bei einem verfügbaren NaC-Checkout zusätzlich `--nac-root` für den Erstimport-/Synchronisationsabgleich.
- Lizenzzuordnung: fachliches Turtle und Diagramme `CC-BY-4.0`, ausführbare Skripte und technische Workflows `AGPL-3.0-or-later` gemäß [LICENSES/README.md](LICENSES/README.md).
