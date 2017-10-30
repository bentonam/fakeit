# Airlines Model

### Example Document

```json
{
  "_id": "airline_DAL",
  "doc_type": "airline",
  "airline_name": "Delta Air Lines",
  "airline_iata": "DL",
  "airline_icao": "DAL",
  "callsign": "DELTA",
  "iso_country": "US",
  "active": true
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  doc_type:
    type: string
    description: The document type
  airline_name:
    type: string
    description: The name of the airline
  airline_iata:
    type: string
    description: The airlines iata code if availabe, otherwise null
  airline_icao:
    type: string
    description: The airlines icao code if available, otherwise null
  callsign:
    type: string
    description: The airlines callsign if available, otherwise null
  iso_country:
    type: string
    description: The ISO country code the airline is based in
  active:
    type: boolean
    description: Whether or not the airline is active
```
