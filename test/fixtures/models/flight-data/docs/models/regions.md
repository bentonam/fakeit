# Regions Model

### Example Document

```json
{
  "_id": "region_US-KS",
  "region_id": 306092,
  "doc_type": "region",
  "region_code": "US-KS",
  "local_code": "KS",
  "region_name": "Kansas",
  "continent_code": "NA",
  "iso_country": "US"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  region_id:
    type: integer
    description: The regions id
  doc_type:
    type: string
    description: The document type
  region_code:
    type: string
    description: The ISO region code
  local_code:
    type: string
    description: The local code for the region
  region_name:
    type: string
    description: The regions name
  continent_code:
    type: string
    description: The ISO continent code for the region
  iso_country:
    type: string
    description: The ISO country code for the region
```

