# Airport Frequencies Model

### Example Document

```json
{
  "_id": "airport_3605_frequencies",
  "airport_id": 3605,
  "doc_type": "airport-frequencies",
  "airport_ident": "KICT",
  "frequencies": [
    59983,
    59982,
    59984,
    59985,
    59986,
    59987,
    59988,
    59989,
    59990
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
    description: The airports identifier
  frequencies:
    type: array
    description: An array of frequency_ids used by the airport
```
