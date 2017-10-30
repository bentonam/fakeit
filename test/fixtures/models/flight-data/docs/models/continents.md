
# Continents Model

### Example Document

```json
{
  "_id": "continent_NA",
  "continent_code": "NA",
  "doc_type": "continent",
  "continent_name": "North America"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  continent_code:
    type: string
    description: The ISO continent code
  doc_type:
    type: string
    description: The document type
  continent_name:
    type: string
    description: The continent name
```
