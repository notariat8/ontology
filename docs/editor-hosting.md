# Gehosteter NaC-Fall-Editor: Betriebsvertrag

Status: technischer Entwurf, noch nicht auf einem Cloud-Host bereitgestellt und noch nicht mit notariellen Nutzerinnen oder Nutzern abgenommen.

Der gehostete Dienst läuft aus diesem Repository als Container. Er liefert Frontend und API unter **einer HTTPS-Webadresse**. GitHub bleibt der dauerhafte Speicher für die 20 Fallontologien; der Dienst verwendet eine GitHub App zur Anmeldung der zwei bis drei Bearbeitenden. Er benötigt keine eigene Datenbank. Die lokale Editor-Version (`scripts/case_editor.py`) bleibt für Entwicklung und Offline-Tests verfügbar.

**Codex-Integration:** Der Container enthält Python und RDFLib; auf den Geräten der fachlichen Bearbeitenden wird dafür nichts installiert. Ein optionaler Codex-Skill könnte später NaC-Abgleich, Quellenprüfung und PR-Vorbereitung als geführte Aufgaben anbieten. Nach den [OpenAI Docs zu Skills](https://developers.openai.com/plugins/build/skills) liefert ein Skill Anleitungen, während ein MCP-Server Live-Daten, Authentifizierung und kontrollierte Aktionen bereitstellt. Die [offizielle Plugin-Anleitung](https://developers.openai.com/plugins/build/app-quickstart) beschreibt eine eigene eingebettete Plugin-Oberfläche für ChatGPT; für Codex nennt sie die MCP-Werkzeuge. Deshalb bleibt die unabhängig erreichbare Weboberfläche der Editor für Notare. Ein Codex-Skill wäre ein zusätzlicher Wartungszugang für NaC- und Ontologie-Maintainer, kein Ersatz für den Dienst oder dessen Rechteprüfung.

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
| `ONTOLOGY_MAINTAINERS` | Kommagetrennte GitHub-Benutzernamen für Änderungen am gemeinsamen Vokabular in `ontology/core.ttl`; Teilmenge von `EDITOR_USERS`. Leer bedeutet nur lesbar. |
| `PORT` | Optionaler interner Port; Standard `8080` |

Die GitHub App braucht auf **diesem einen Repository** `Contents: read and write` sowie `Pull requests: read and write`. Für die Anmeldung muss der Web Application Flow aktiviert sein; der Callback ist die Editor-Adresse mit `/callback`. Bearbeitende brauchen GitHub-Zugriff auf das Repository und autorisieren die App selbst. Die API verwendet ein Nutzerzugriffstoken, dessen Rechte durch die Schnittmenge von Nutzer- und App-Rechten begrenzt sind. Nur die API sieht das Token. Im Browser liegt ein zufälliges, `HttpOnly`, `Secure`, `SameSite=Lax` Sitzungs-Cookie und ein separater CSRF-Wert für Schreibzugriffe.

Die Sitzung liegt **flüchtig im Speicher eines einzelnen Dienstprozesses** und endet spätestens nach acht Stunden oder beim Neustart. Daher zunächst **genau eine Instanz** betreiben; mehrere Instanzen erfordern einen gemeinsamen, geschützten Sitzungsspeicher. Der Host muss HTTPS terminieren, Anfragen an den Container weiterleiten und seine Geheimnisse verwalten. Für einen privaten Katalog dürfen weder Fall-Dateien noch generierte Suchdaten über einen öffentlichen Static-Host ausgeliefert werden.

Der Containerport darf nur aus dem internen Netz des HTTPS-Proxys erreichbar sein. In Proxy-Zugriffslogs dürfen die Abfrageparameter von `/callback` nicht erscheinen, weil sie einen einmaligen GitHub-Anmeldecode enthalten. Der Anwendungsserver protokolliert dort nur den Pfad. Host- und Proxy-Logs dürfen keine Sitzungscookies oder GitHub-Tokens enthalten.

Der öffentliche Endpunkt `/healthz` bestätigt ausschließlich, dass der Prozess HTTP-Anfragen beantwortet; er gibt keine Repository- oder Nutzerdaten aus. Der Container nutzt ihn als Gesundheitsprüfung. Die CI startet das gebaute Image mit Platzhalterkonfiguration und prüft den Endpunkt, die Startseite und den gesperrten API-Zugriff ohne Sitzung. Das ist ein Laufzeittest ohne echte GitHub-Anmeldung; der OAuth- und PR-Weg bleibt Teil der späteren Integrationsabnahme.

Die fallübergreifende Bausteinsuche liest die 20 Turtle-Module und den Katalog aus demselben `main`-Commit. Der Dienst hält diesen Index pro Commit im flüchtigen Speicher; der Browser durchsucht die geladenen Treffer lokal. Änderungen auf einem noch nicht eingereichten Arbeitszweig erscheinen erst nach dem Merge in diesem gemeinsamen Suchstand.

## Bearbeitungsweg

1. Der Browser meldet die Person über die GitHub App an. Nur ihre zugänglichen Repository-Daten lassen sich laden.
2. **Änderung beginnen** erstellt einen eigenen Branch aus dem aktuellen `main`-Commit. Fall und Katalog werden für Lesen, Vorschau und Speichern jeweils über denselben aufgelösten Branch-Commit gelesen. Auch das gemeinsame Vokabular wird an einen konkreten Commit gebunden.
3. Vorschau und Speichern prüfen die Turtle-Daten mit demselben Modell. Das Speichern erstellt einen Git-Commit mit genau `cases/<slug>/ontology.ttl` und der daraus erzeugten `README.md`. Ein konkurrierender Branch-Commit führt zu einem Konflikt statt zu einem erzwungenen Überschreiben.
4. **Zur Fachprüfung einreichen** übergibt Begründung und Quellenstand an GitHub und öffnet einen zur Prüfung bereiten Pull Request. Die bestehenden Actions prüfen den Gesamtstand.
5. Der **Prüfkorb** zeigt die fachlichen Unterschiede zwischen dem gemeinsamen Ausgangscommit und dem PR-Stand. Die Ansicht prüft zusätzlich, ob der PR nur einen Fall enthält, ob alle RDF-Änderungen erklärt werden und ob die Mermaid-Leseseite zu Turtle passt. Ein anderes eingetragenes Notarkonto kann eine begründete Fachfreigabe abgeben; andere Editoren können Änderungen anfordern. Die Entscheidung wird als GitHub-Review auf dem konkret geprüften Commit dokumentiert. Der Editor führt keinen Merge aus.
6. Der **Änderungsverlauf** zeigt bis zu 20 frühere GitHub-Commits eines Falls. Eine ältere Fassung wird nur dann als neuer Branch mit Turtle und daraus erzeugter Mermaid-Seite angeboten, wenn ihr RDF-Graph vollständig aus den Editorfeldern rekonstruiert werden kann. Die Änderung ist erst nach Begründung, Quellenstand und notarieller Prüfung ein PR-Kandidat; sie ersetzt `main` nicht direkt. Bei einer zwischenzeitlichen Änderung des `main`-Commits muss die Vorschau erneut geladen werden.

Für das **gemeinsame Vokabular** gibt es einen eigenen Arbeitsbereich. Eingetragene Ontologie-Maintainer können bestehende Begriffe erklären, benennen und ihre Oberklasse, ihren Geltungsbereich oder Datentyp ändern sowie neue Klassen und Eigenschaften ergänzen. Der Editor zeigt für jeden Begriff seine technische Verwendung in den 20 Fallmodulen und den zugehörigen Katalogeinträgen; die Fälle lassen sich daraus öffnen. Diese Zählung ist keine notarielle Beurteilung aller fachlichen Folgen. Im gehosteten Dienst stammen sämtliche dazu gelesenen Turtle-Dateien aus demselben `main`-Commit; der SHA wird angezeigt und die Übersicht pro Commit im Dienstspeicher zwischengespeichert. Der Editor schreibt nur `ontology/core.ttl` auf einem gesonderten Branch. Kennung und Art bestehender Begriffe sind fest; vorhandene Begriffe können nicht aus der Oberfläche gelöscht werden. Die Änderungsvorschau prüft die Turtle-Aussagen und hält unveränderte Begriffsblöcke textlich intakt. Das Vokabular hat keine Mermaid-Seite. Ein Vokabular-PR erscheint ebenfalls im Prüfkorb, mit fachlichen Unterschieden und notarieller Review auf dem geprüften Commit. Einzelne Falländerungen und Vokabularänderungen werden nicht in demselben Editor-Branch gemischt.

`NOTARY_REVIEWERS` steuert nur die Freigabe **in dieser Oberfläche**. Für eine verbindliche Pflichtfreigabe vor dem Merge braucht das GitHub-Repository zusätzlich passende Schutzregeln und benannte Reviewer-Konten. Deren Einrichtung bleibt offen, bis die GitHub-Benutzernamen vorliegen. PRs mit weiteren Dateien oder unvollständig erklärten RDF-Änderungen müssen direkt in GitHub geprüft werden.

**GitHub-Grenze am 28.09.2026:** Die API-Abfragen für Rulesets und Branch Protection auf `notariat8/ontology` lieferten für das derzeit private Repository HTTP 403 mit „Upgrade to GitHub Pro or make this repository public to enable this feature.“ Der Editor kann daher aktuell eine notarielle Review dokumentieren, aber einen direkten Merge ohne diese Review nicht auf GitHub-Ebene verhindern. Vor produktiver Nutzung muss die Repository-Sichtbarkeit oder der GitHub-Tarif für eine verpflichtende Schutzregel entschieden und die Regel nachweislich aktiviert werden. Eine Veröffentlichung ist damit nicht beschlossen. Die Abnahme steht in [Issue #7](https://github.com/notariat8/ontology/issues/7).

Das ist ein **technischer Bereitstellungsvertrag**, keine bestätigte Produktqualität. Vor produktiver Nutzung fehlen mindestens eine reale GitHub-App-Integration gegen ein Testrepository, eine HTTPS-Bereitstellung, Sicherheitsprüfung und ein moderierter Nutzertest mit Notarinnen oder Notaren. Es werden weiterhin keine realen Aktenwerte im Repository gespeichert.
