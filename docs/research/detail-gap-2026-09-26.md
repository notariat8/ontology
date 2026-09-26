# Recherche: Detailtiefe der 20 NaC-Fälle

Stand: 26.09.2026. Bezugsstand der vorhandenen NaC-Graphen:
[`862c87e1e378657f0066faed1bd36b830be2146d`](https://github.com/notariat8/NaC/tree/862c87e1e378657f0066faed1bd36b830be2146d/usecases).

## Warum der bisherige Graph so knapp war

Der Erstimport hat die **usecase-lokalen Knowledge Graphs aus NaC
inhaltstreu** übernommen. Diese Graphen sind ein Katalog von Fragen,
Dokumentarten und Gates, keine notariellen Arbeitsanweisungen. Die
frühere Recherche zielte auf Ontologie, Turtle, SHACL, BPMN und Hosting;
sie beschaffte keine neun Kapitel umfassenden notariellen SOPs pro
Geschäftsvorfall. Der jetzt bereitgestellte Ablaufplan ist eine interne
Arbeitsanweisung. Eine Suche nach seinem exakten Titel und Dateinamen
ergab keine öffentliche Kopie. Die Detailtiefe war daher im damaligen
Quellenbestand nicht vorhanden. Das hätte als **inhaltliche Lücke**
gekennzeichnet und nach einer SOP oder fachlichen Fallprüfung gefragt
werden müssen, statt den katalogtreuen Import als fachlich vollständig
zu behandeln.

NaC hatte am gepinnten Commit bereits ein
[Deep-Process-Routing](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/docs/de/architecture/notarial-deep-process-candidate-routing.md)
und ein [First-Wave-Deep-Model](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/docs/de/architecture/first-wave-process-deep-model.md).
Dieses nennt acht generische Prozessphasen für vier erste Fälle:
Online-GmbH-Gründung, Immobilienkaufvertrag, Handelsregisteranmeldung
und Vorsorgevollmacht/Patientenverfügung. Erbausschlagung gehörte
[nicht zu dieser ersten Welle](https://github.com/notariat8/NaC/blob/862c87e1e378657f0066faed1bd36b830be2146d/docs/de/architecture/first-wave-bpmn-outline.md).
Auch dieses Modell beansprucht keine interne notarielle SOP und
mutiert die vorhandenen BPMN-Dateien nicht. Die vorherige Recherche
hätte diese Unterscheidung zwischen Phasenvertrag und ausführlicher
Arbeitsanweisung deutlicher ausweisen müssen.

Der Erbausschlagungsplan liefert eine wiederverwendbare **Struktur**:
Auftrag, Sachverhalt, materielle Prüfung, Frist/Zuständigkeit,
Form/Belehrung, Vertretung/Genehmigung, Vollzug, Nachbearbeitung,
Abschluss sowie Eskalation und Nachweise. Die Inhalte einzelner Gates
und Rechtswege sind je Fall verschieden; bloßes Kopieren würde
unbelegte Pflichten erzeugen. Das gleiche Schema kann für die anderen
19 Fälle erst nach fallbezogener Primärquellen- und notarieller Prüfung
verwendet werden.

## Primärquellenprüfung für die übrigen 19 Vorgangsarten

Die folgenden Quellen stammen von der Bundesnotarkammer (`notar.de`)
oder ihrer Verfahrensplattform. Sie bieten fachliche Anhaltspunkte,
aber keine mit dem bereitgestellten Ablaufplan gleichwertige interne
Arbeitsanweisung mit Rollen, Wiedervorlagen, Ausnahmewegen und
Abschlussnachweisen. `SOP fehlt` beschreibt die **Recherchelage**, nicht
das Fehlen einer solchen Arbeitsanweisung bei NaC oder Notariaten.

| NaC-Vorgangsart | Geprüfter öffentlicher Ausgangspunkt | Befund |
| --- | --- | --- |
| Adoption / familienrechtliche Erklärungen | [Kinder und Adoption](https://www.notar.de/themen/familie/kinder-und-adoption) | Antrag, Einwilligungen und Belehrung genannt; SOP fehlt. |
| Bauträgervertrag | [Wohnungs- und Bauträgerglossar](https://www.notar.de/fileadmin/user_upload_notarde/dokumente/Glossar_Wohnungskauf-Bautraegervertraege.pdf) | Vertragsbegriffe und Sicherungsthemen; SOP fehlt. |
| Ehevertrag / Scheidungsfolgenvereinbarung | [Scheidung](https://www.notar.de/themen/familie/scheidung) | Regelungsfelder benannt; SOP fehlt. |
| Erbscheinsantrag / Nachlass | [Erbfall](https://www.notar.de/themen/vererben-und-schenken/erbfall) | Rolle des Notars und Gerichts; SOP fehlt. |
| Geschäftsanteilsübertragung GmbH | [Umorganisation](https://www.notar.de/themen/unternehmen/umorganisation) | Form und gesellschaftsrechtliche Einordnung; SOP fehlt. |
| Gesellschafterbeschluss GmbH/UG | [Notarielle Online-Verfahren](https://www.notar.de/themen/online-verfahren) | Online-Fähigkeit bestimmter Beschlüsse; SOP fehlt. |
| Grundschuld / Hypothekenbestellung | [Kreditsicherheiten](https://www.notar.de/themen/immobilien/kreditsicherheiten) | Grundpfandrechte und Finanzierungsvollmacht; SOP fehlt. |
| Handelsregisteranmeldung | [Handelsregister](https://www.notar.de/themen/unternehmen/handelsregister) | Entwurf, Einreichung und Kontrolle angesprochen; SOP fehlt. |
| Immobilienkaufvertrag | [Immobilien](https://www.notar.de/themen/immobilien), [Kaufpreisfälligkeit](https://www.notar.de/themen/immobilien/kaufpreisfaelligkeit) | Teilablauf und Sicherungsvoraussetzungen ausführlicher; vollständige SOP fehlt. |
| Löschungsbewilligung / Grundbuchlöschung | [Grundschuld löschen](https://www.notar.de/aktuelles/details/grundschuld-loeschen-was-nach-der-kreditrueckzahlung-zu-tun-ist) | Bewilligung und Löschungsantrag erläutert; SOP fehlt. |
| Online-GmbH-Gründung | [Gründung](https://www.notar.de/themen/unternehmen/gruendung), [Online-Verfahren](https://online.notar.de/) | Dokumente und Registerweg erläutert; SOP fehlt. |
| Pflichtteilsverzicht / Erbverzicht | [Pflichtteilsverzicht](https://www.notar.de/aktuelles/details/pflichtteilsverzicht-nur-mit-notar-moeglich) | Beteiligte und notarielle Form angesprochen; SOP fehlt. |
| Schenkung / Übertragung | [Schenkung](https://www.notar.de/themen/vererben-und-schenken/schenkung) | Gestaltungsfragen und Übertragungsarten; SOP fehlt. |
| Teilungserklärung WEG | [Wohnungskauf](https://www.notar.de/themen/immobilien/wohnungskauf) | Teilungserklärung und Gemeinschaftsordnung; SOP fehlt. |
| Testament / Erbvertrag | [Testament und Erbvertrag](https://www.notar.de/themen/vererben-und-schenken/testament/erbvertrag) | Instrumente und Bindungen; SOP fehlt. |
| Unterschriftsbeglaubigung | [Beurkundung oder Beglaubigung](https://www.notar.de/aktuelles/details/beurkundung-oder-beglaubigung) | Formunterschiede; SOP fehlt. |
| Vereinsregisteranmeldung | [Notarielle Online-Verfahren](https://online.notar.de/) | Registeranmeldung und Online-Option; SOP fehlt. |
| Vollmacht Immobilien/Gesellschaft | [Kreditsicherheiten](https://www.notar.de/themen/immobilien/kreditsicherheiten), [Online-Verfahren](https://www.notar.de/themen/online-verfahren) | Einzelne Vollmachtskontexte; einheitliche SOP fehlt. |
| Vorsorgevollmacht / Patientenverfügung | [Vorsorgevollmacht](https://www.notar.de/themen/notfallvorsorge/vorsorgevollmacht), [Patientenverfügung](https://www.notar.de/themen/notfallvorsorge/patientenverfuegung) | Inhalte, Register und Anwendung; SOP fehlt. |

## Entscheidung für die nächste Ausbaustufe

Die 19 Fälle bleiben bei ihrem nachprüfbaren NaC-Import. Ein gleich
detaillierter Ausbau wird erst nach einer tragfähigen Fallvorlage und
notarieller Prüfung als fachlicher Entwurf erstellt. Der
Erbausschlagungsplan ist die Strukturvorlage, aber kein fachlicher
Textbaustein für andere Rechtsgebiete. Als Erstes sollten je Fall
Auftragsvarianten, entscheidende Unterlagen, fachliche Ausnahmen,
Vollzugswege und prüfbare Nachweise von NaC/Notaren mit dem
[Erhebungsbogen](sop-erhebungsbogen.md) erhoben werden.
