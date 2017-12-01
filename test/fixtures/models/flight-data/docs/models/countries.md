# Countries Model

### Example Document

```json
{
  "_id": "country_US",
  "country_code": "US",
  "doc_type": "country",
  "country_name": "United States",
  "continent_code": "NA"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  country_code:
    type: string
    description: The ISO country code
  doc_type:
    type: string
    description: The document type
  country_name:
    type: string
    description: The country name
  continent_code:
    type: string
    description: The ISO continent code the country is located in
```
