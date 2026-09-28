# Gehosteter NaC-Fall-Editor: Betriebsvertrag

Status: technischer Entwurf, noch nicht auf einem Cloud-Host bereitgestellt und noch nicht mit notariellen Nutzerinnen oder Nutzern abgenommen.

Der gehostete Dienst läuft aus diesem Repository als Container. Er liefert Frontend und API unter **einer HTTPS-Webadresse**. GitHub bleibt der dauerhafte Speicher für die 20 Fallontologien; der Dienst verwendet eine GitHub App zur Anmeldung der zwei bis drei Bearbeitenden. Er benötigt keine eigene Datenbank. Die lokale Editor-Version (`scripts/case_editor.py`) bleibt für Entwicklung und Offline-Tests verfügbar.

## Konfiguration

Die folgenden Werte werden **ausschließlich im Geheimnisspeicher des Hosts** gesetzt:

| Variable | Inhalt |
| --- | --- |
| `GITHUB_APP_CLIENT_ID` | Client-ID der für dieses Repository installierten GitHub App |
| `GITHUB_APP_CLIENT_SECRET` | Client-Secret der App; niemals in Git speichern |
| `GITHUB_REPOSITORY` | `owner/repo` der Ontologie |
| `PUBLIC_ORIGIN` | HTTPS-Ursprung des Editors ohne Pfad; Callback ist `<PUBLIC_ORIGIN>/callback` |
| `EDITOR_USERS` | Kommagetrennte GitHub-Benutzernamen der zwei bis drei berechtigten Editoren |
| `NOTARY_REVIEWERS` | Kommagetrennte GitHub-Benutzernamen der fachlich freigabeberechtigten Notarinnen und Notare; Teilmenge von `EDITOR_USERS`. Bis die Konten feststehen, leer lassen: Dann ist eine Fachfreigabe im Editor gesperrt. |
| `PORT` | Optionaler interner Port; Standard `8080` |

Die GitHub App braucht auf **diesem einen Repository** `Contents: read and write` sowie `Pull requests: read and write`. Für die Anmeldung muss der Web Application Flow aktiviert sein; der Callback ist die Editor-Adresse mit `/callback`. Bearbeitende brauchen GitHub-Zugriff auf das Repository und autorisieren die App selbst. Die API verwendet ein Nutzerzugriffstoken, dessen Rechte durch die Schnittmenge von Nutzer- und App-Rechten begrenzt sind. Nur die API sieht das Token. Im Browser liegt ein zufälliges, `HttpOnly`, `Secure`, `SameSite=Lax` Sitzungs-Cookie und ein separater CSRF-Wert für Schreibzugriffe.

Die Sitzung liegt **flüchtig im Speicher eines einzelnen Dienstprozesses** und endet spätestens nach acht Stunden oder beim Neustart. Daher zunächst **genau eine Instanz** betreiben; mehrere Instanzen erfordern einen gemeinsamen, geschützten Sitzungsspeicher. Der Host muss HTTPS terminieren, Anfragen an den Container weiterleiten und seine Geheimnisse verwalten. Für einen privaten Katalog dürfen weder Fall-Dateien noch generierte Suchdaten über einen öffentlichen Static-Host ausgeliefert werden.

Der Containerport darf nur aus dem internen Netz des HTTPS-Proxys erreichbar sein. In Proxy-Zugriffslogs dürfen die Abfrageparameter von `/callback` nicht erscheinen, weil sie einen einmaligen GitHub-Anmeldecode enthalten. Der Anwendungsserver protokolliert dort nur den Pfad. Host- und Proxy-Logs dürfen keine Sitzungscookies oder GitHub-Tokens enthalten.

## Bearbeitungsweg

1. Der Browser meldet die Person über die GitHub App an. Nur ihre zugänglichen Repository-Daten lassen sich laden.
2. **Änderung beginnen** erstellt einen eigenen Branch aus dem aktuellen `main`-Commit. Der Fall wird von GitHub auf diesem Branch gelesen.
3. Vorschau und Speichern prüfen die Turtle-Daten mit demselben Modell. Das Speichern erstellt einen Git-Commit mit genau `cases/<slug>/ontology.ttl` und der daraus erzeugten `README.md`. Ein konkurrierender Branch-Commit führt zu einem Konflikt statt zu einem erzwungenen Überschreiben.
4. **Zur Fachprüfung einreichen** übergibt Begründung und Quellenstand an GitHub und öffnet einen zur Prüfung bereiten Pull Request. Die bestehenden Actions prüfen den Gesamtstand.
5. Der **Prüfkorb** zeigt die fachlichen Unterschiede zwischen dem gemeinsamen Ausgangscommit und dem PR-Stand. Die Ansicht prüft zusätzlich, ob der PR nur einen Fall enthält, ob alle RDF-Änderungen erklärt werden und ob die Mermaid-Leseseite zu Turtle passt. Ein anderes eingetragenes Notarkonto kann eine begründete Fachfreigabe abgeben; andere Editoren können Änderungen anfordern. Die Entscheidung wird als GitHub-Review auf dem konkret geprüften Commit dokumentiert. Der Editor führt keinen Merge aus.

`NOTARY_REVIEWERS` steuert nur die Freigabe **in dieser Oberfläche**. Für eine verbindliche Pflichtfreigabe vor dem Merge braucht das GitHub-Repository zusätzlich passende Schutzregeln und benannte Reviewer-Konten. Deren Einrichtung bleibt offen, bis die GitHub-Benutzernamen vorliegen. PRs mit weiteren Dateien oder unvollständig erklärten RDF-Änderungen müssen direkt in GitHub geprüft werden.

**GitHub-Grenze am 28.09.2026:** Die API-Abfragen für Rulesets und Branch Protection auf `notariat8/ontology` lieferten für das derzeit private Repository HTTP 403 mit „Upgrade to GitHub Pro or make this repository public to enable this feature.“ Der Editor kann daher aktuell eine notarielle Review dokumentieren, aber einen direkten Merge ohne diese Review nicht auf GitHub-Ebene verhindern. Vor produktiver Nutzung muss die Repository-Sichtbarkeit oder der GitHub-Tarif für eine verpflichtende Schutzregel entschieden und die Regel nachweislich aktiviert werden. Eine Veröffentlichung ist damit nicht beschlossen. Die Abnahme steht in [Issue #7](https://github.com/notariat8/ontology/issues/7).

Das ist ein **technischer Bereitstellungsvertrag**, keine bestätigte Produktqualität. Vor produktiver Nutzung fehlen mindestens eine reale GitHub-App-Integration gegen ein Testrepository, eine HTTPS-Bereitstellung, Sicherheitsprüfung und ein moderierter Nutzertest mit Notarinnen oder Notaren. Es werden weiterhin keine realen Aktenwerte im Repository gespeichert.
