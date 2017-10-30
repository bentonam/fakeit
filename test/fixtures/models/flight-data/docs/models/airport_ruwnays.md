# Airport Runways Model

### Example Document

```json
{
  "_id": "airport_3605_runways",
  "airport_id": 3605,
  "doc_type": "airport-runways",
  "airport_ident": "KICT",
  "runways": [
    240444,
    240443,
    240445
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
    description: The airport id
  doc_type:
    type: string
    description: The document type
  airport_ident:
    type: string
    description: The airports identifer
  runways:
    type: array
    description: An array of runway ids that belong to the airport
```
