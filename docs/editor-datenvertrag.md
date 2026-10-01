# Anbindung an editor8

Dieses Repository ist die einzige Pflegequelle für die 20 Notar-Fachmodelle. Die Software liegt in [editor8](https://github.com/ontologie8/editor8). Eine gemeinsame Codex-Projektwurzel ist nicht erforderlich.

Der NaC-Adapter Version 1 liest `catalog/nac-baseline.json` mit genau den unveränderten kanonischen `business_case_type_ids`, `catalog/nac-usecases.ttl`, `ontology/core.ttl` und `cases/<id>/ontology.ttl`. Er liest Dateien eines Cloud-Snapshots am gleichen Commit und schlägt begrenzte Änderungen auf eigenen Datenzweigen vor. Falländerungen enthalten Turtle und die erzeugte `README.md`; Vokabularänderungen nur `ontology/core.ttl`. Die Software enthält keine zweite gepflegte Kopie dieses Datensatzes.

`editor_contract_version: 1` ist im JSON künftig optional ergänzbar; sein Fehlen bedeutet den bestehenden Version-1-Vertrag. Die Migration ändert keine Fallkennungen oder fachlichen Turtle-Inhalte. Andere RDF-Schemata verlangen einen eigenen Softwareadapter.

Vor Abnahme weiterhin Katalog-, Fall- und Mermaid-Prüfung ausführen. Fachliche Freigabe benötigt dokumentierte notarielle Prüfung. Anwendungscode, Container und Hosting-Unterlagen dürfen nicht wieder in dieses Datenprojekt aufgenommen werden; die CI prüft diese Grenze.

Die alten Editorzweige bleiben als Herkunft erhalten. Ihre Softwareänderungen werden durch editor8 ersetzt. Die darin vorhandene zusätzliche Fachwortschatzänderung wird als eigener ungeprüfter Datenentwurf erhalten, unabhängig vom Softwarewechsel. Der SOP-Fachzweig bleibt unverändert.
