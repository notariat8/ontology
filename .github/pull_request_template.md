## Änderung und NaC-Bezug

- NaC-Issue oder Änderungsgrund:
- Betroffene `BusinessCaseTypeId`-Werte:
- NaC-Commit oder Release, gegen den geprüft wurde:
- Rechts-/Fachquelle und Geltungsstand, falls fachlicher Inhalt geändert wird:

## Prüfung

- [ ] Der Katalog enthält genau die 20 vereinbarten kanonischen NaC-IDs; Aliase sind ausgeschlossen.
- [ ] `python scripts/validate_catalog.py` ist erfolgreich.
- [ ] `python scripts/validate_cases.py` und `python scripts/render_case_docs.py --check` sind erfolgreich.
- [ ] Der Abgleich mit einem aktuellen NaC-Checkout (`--nac-root`) oder GitHub-Stand ist dokumentiert.
- [ ] Eine fachliche Freigabe ist durch notarielles Review belegt, oder der Stand ist ausdrücklich als ungeprüfter Entwurf gekennzeichnet.
- [ ] Keine Mandatsdaten, Personendaten, Dokumentinhalte oder Secrets sind enthalten.

Fachliche Änderungen werden erst nach dokumentiertem notariellem Review übernommen. Die konkreten GitHub-Reviewer-Konten werden zugeordnet, sobald die Notarinnen und Notare feststehen.
