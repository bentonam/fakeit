# Airport Navaids Model

### Example Document

```json
{
  "_id": "airport_3605_navaids",
  "airport_id": 3605,
  "doc_type": "airport-navaids",
  "airport_ident": "KICT",
  "navaids": [
    89137,
    89144
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
  navaids:
    type: array
    description: An array of navaid_ids
```
