# UI-Prüfung des NaC-Fall-Editors

Stand: 29.09.2026. Diese Prüfung bewertet die **Lesbarkeit und Aufgabenführung** der Editoroberfläche, keine notarielle Richtigkeit der Falldaten.

## Warum die erste Oberfläche von der Palantir-Referenz abwich

Der Aufbau stammt aus dem ersten lokalen Browser-Editor (Commit `d421489`) und wurde mit weiteren Funktionen schrittweise erweitert. Er verwendet selbst geschriebenes HTML, JavaScript und CSS, kein übernommenes Designsystem und keine Palantir-Komponenten. Die Palantir-Dokumentation wurde für Funktionen verglichen, aber nicht als prüfbare Vorgabe für Seitenhierarchie, Blickführung und Arbeitsaufgaben umgesetzt. Es gab vor dem Hosting weder einen moderierten Nutzertest mit Notariatsfachkräften noch eine Abnahme anhand gerenderter Desktop- und Mobilansichten. Technische Tests belegten Datenverarbeitung und Zugriff, nicht Bedienbarkeit.

Die [Palantir-Dokumentation zum Ontology Manager](https://www.palantir.com/docs/foundry/ontology-manager/overview) beschreibt eine dauerhafte Kopf- und Seitenleiste sowie eine Objektübersicht, aus der Eigenschaften und Beziehungen gezielt geöffnet werden. Im ersten NaC-Layout lagen dagegen Quellenlinks und Erläuterungstext im Zentrum; das Diagramm war in einem eingeklappten Bereich einer anderen Registerkarte verborgen. Damit verlangte die Oberfläche, Zusammenhänge über Navigation und Repository-Links selbst zu rekonstruieren.

## Korrigierte Informationshierarchie

| Platz | Aufgabe |
| --- | --- |
| Kopfbereich | Arbeitsstand, Suche über alle Fälle, Änderung beginnen und speichern. |
| Linke Seitenleiste | Eine der 20 Vorgangsarten wählen. |
| Fallübersicht | Kurzbeschreibung und **direkt sichtbarer, interaktiver Graph des ganzen Falls**. Ein Klick auf einen Baustein markiert ihn und erklärt seine direkten Verbindungen in Textform. |
| Fallübersicht bei Bedarf | Auf einen Baustein und seine Nachbarn fokussieren; die Gesamtansicht bleibt umschaltbar. |
| Kontextdialog | Rechtsquellen, NaC-Herkunft und Prozessablauf nur bei Rückfragen öffnen. |
| Weitere Arbeitsbereiche | Fachliche Bausteine und Beziehungen ändern, Änderungen einreichen oder prüfen, gemeinsame Begriffe pflegen. |

Die Oberfläche zeigt keine Turtle-Rohansicht mehr. Turtle und die daraus erzeugten Mermaid-Seiten bleiben im Git-Repository die maschinenlesbare Pflegequelle; die App stellt die daraus abgeleiteten fachlichen Inhalte dar. Der Graph zeigt nur erfasste Beziehungen. Bei Erbausschlagung sind derzeit 19 Bausteine und 6 Beziehungen vorhanden; 9 Bausteine haben keine erfasste Verbindung. Die App benennt diese Lücke, statt fachliche Verbindungen zu erfinden.

## Prüf- und Lernschleife

1. Die Aufgaben zuerst als konkrete Szenarien formulieren: Fall finden, Zusammenhang erklären, Baustein ändern, Quelle bei Rückfrage prüfen, Änderung zur Fachprüfung geben.
2. Desktop und schmale Ansicht **gerendert** ansehen und jeden Weg selbst durchklicken. Eine Codeprüfung allein reicht für Layout nicht.
3. Eine Notariatsfachkraft und eine Person für Ontologiepflege dieselben Szenarien ohne Anleitung bearbeiten lassen. Beobachten, wo sie suchen, stocken oder Begriffe missverstehen; keine Echtdaten eingeben.
4. Änderungen an der Seitenhierarchie anhand dieser Beobachtungen vornehmen und den Test wiederholen. Erfolg bedeutet, dass die Zielaufgaben gefunden und verstanden werden; grüne CI ist dafür kein Ersatz.

Die lokale Chrome-Prüfung am 29.09.2026 zeigte den ganzen Erbausschlagungsgraphen in der Fallübersicht und die Quellen außerhalb des Hauptbereichs. Die gehostete Revision `ca-nac-ontology-editor--0000005` liefert das neue HTML mit Graph und Quellendialog aus. Diese technischen Nachweise ersetzen keinen Nutzertest. Für dessen fachliche Abnahme werden reale Arbeitsaufgaben und mindestens eine Notariatsfachkraft benötigt; zusätzliche Palantir-Screenshots sind für den nächsten technischen Schritt nicht erforderlich.
