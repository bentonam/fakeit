# Frequency Model

### Example Document

```json
{
  "_id": "frequency_59983",
  "frequency_id": 59983,
  "doc_type": "frequency",
  "airport_id": 3605,
  "airport_ident": "KICT",
  "type": "APP",
  "description": "APP",
  "frequency_mhz": 32.71
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  frequency_id:
    type: integer
    description: The frequency id
  doc_type:
    type: string
    description: The document type
  airport_id:
    type: integer
    description: The airport id that uses the frequency
  airport_ident:
    type: string
    description: The airport identifier
  type:
    type: string
    description: The frequency type
  description:
    type: string
    description: The frequency description
  frequency_mhz:
    type: float
    description: The mhz of the frequency
```
