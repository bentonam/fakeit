# Airport Airlines Model

### Example Document

```json
{
  "_id": "airport_3605_airlines",
  "airport_id": 3605,
  "doc_type": "airport-airlines",
  "airport_ident": "KICT",
  "airlines": [
    "AA",
    "AF",
    "AZ",
    "DL",
    "FL",
    "G4",
    "KL",
    "UA",
    "US",
    "WN"
  ]
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  airport_id:
    type: integer
    description: The route id
  doc_type:
    type: string
    description: The document type
  airport_ident:
    type: string
    description: The airports iata / icao code
  airlines:
    type: array
    description: An array of airline codes at the airport
```
