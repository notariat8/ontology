# Fallontologien für die 20 kanonischen NaC-Vorgangsarten

Jeder Fall hat eine eigenständig pflegbare Turtle-Datei und eine daraus erzeugte Mermaid-Sicht. Die beiden historischen NaC-Aliase gehören nicht zu diesem Katalog.

| Vorgangsart | Turtle-Ontologie | Mermaid-Sicht |
| --- | --- | --- |
| Adoption / familienrechtliche Erklärungen | [Turtle](adoption-familienrechtliche-erklaerungen/ontology.ttl) | [Mermaid](adoption-familienrechtliche-erklaerungen/README.md) |
| Bauträgervertrag | [Turtle](bautraegervertrag/ontology.ttl) | [Mermaid](bautraegervertrag/README.md) |
| Ehevertrag / Scheidungsfolgenvereinbarung | [Turtle](ehevertrag-scheidungsfolgenvereinbarung/ontology.ttl) | [Mermaid](ehevertrag-scheidungsfolgenvereinbarung/README.md) |
| Erbausschlagung | [Turtle](erbausschlagung/ontology.ttl) | [Mermaid](erbausschlagung/README.md) |
| Erbscheinsantrag / Nachlassangelegenheiten | [Turtle](erbscheinsantrag-nachlass/ontology.ttl) | [Mermaid](erbscheinsantrag-nachlass/README.md) |
| Geschäftsanteilsübertragung GmbH | [Turtle](geschaeftsanteilsuebertragung-gmbh/ontology.ttl) | [Mermaid](geschaeftsanteilsuebertragung-gmbh/README.md) |
| Gesellschafterbeschluss bei GmbH/UG | [Turtle](gesellschafterbeschluss-gmbh-ug/ontology.ttl) | [Mermaid](gesellschafterbeschluss-gmbh-ug/README.md) |
| Grundschuld / Hypothekenbestellung | [Turtle](grundschuld-hypothekenbestellung/ontology.ttl) | [Mermaid](grundschuld-hypothekenbestellung/README.md) |
| Handelsregisteranmeldung | [Turtle](handelsregisteranmeldung/ontology.ttl) | [Mermaid](handelsregisteranmeldung/README.md) |
| Immobilienkaufvertrag | [Turtle](immobilienkaufvertrag/ontology.ttl) | [Mermaid](immobilienkaufvertrag/README.md) |
| Löschungsbewilligung / Grundbuchlöschung | [Turtle](loeschungsbewilligung-grundbuchloeschung/ontology.ttl) | [Mermaid](loeschungsbewilligung-grundbuchloeschung/README.md) |
| GmbH-/UG-Gründung (online) | [Turtle](online-gmbh-gruendung/ontology.ttl) | [Mermaid](online-gmbh-gruendung/README.md) |
| Pflichtteilsverzicht / Erbverzicht | [Turtle](pflichtteilsverzicht-erbverzicht/ontology.ttl) | [Mermaid](pflichtteilsverzicht-erbverzicht/README.md) |
| Schenkungsvertrag / Übertragungsvertrag | [Turtle](schenkungsvertrag-uebertragungsvertrag/ontology.ttl) | [Mermaid](schenkungsvertrag-uebertragungsvertrag/README.md) |
| Teilungserklärung nach WEG | [Turtle](teilungserklaerung-weg/ontology.ttl) | [Mermaid](teilungserklaerung-weg/README.md) |
| Testament / Erbvertrag | [Turtle](testament-erbvertrag/ontology.ttl) | [Mermaid](testament-erbvertrag/README.md) |
| Beglaubigung von Unterschriften | [Turtle](unterschriftsbeglaubigung/ontology.ttl) | [Mermaid](unterschriftsbeglaubigung/README.md) |
| Vereinsregisteranmeldung | [Turtle](vereinsregisteranmeldung/ontology.ttl) | [Mermaid](vereinsregisteranmeldung/README.md) |
| Vollmacht für Immobilien- oder Gesellschaftsgeschäfte | [Turtle](vollmacht-immobilien-gesellschaftsgeschaefte/ontology.ttl) | [Mermaid](vollmacht-immobilien-gesellschaftsgeschaefte/README.md) |
| Vorsorgevollmacht und Patientenverfügung | [Turtle](vorsorgevollmacht-patientenverfuegung/ontology.ttl) | [Mermaid](vorsorgevollmacht-patientenverfuegung/README.md) |

Die Turtle-Dateien sind die Pflegequelle. Der [Browser-Editor](https://github.com/ontologie8/editor8#lokal-starten) bearbeitet sie über Formulare und erzeugt die Mermaid-Seiten automatisch. Bei manueller Turtle-Pflege `python scripts/render_case_docs.py --write` ausführen. `python scripts/validate_cases.py` prüft die 20 Dateien und ihre Sichten.
