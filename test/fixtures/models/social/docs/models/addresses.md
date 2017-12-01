
# Addresses Model

### Purpose

This model represents a single address.

### Example Document

```json
{
  "_id": "address_f6da3d5c-ffae-5a2e-a62f-696bf93a683f",
  "doc_type": "address",
  "address_id": "f6da3d5c-ffae-5a2e-a62f-696bf93a683f",
  "user_id": 123,
  "address_type": "Work",
  "address_1": "45989 Fiona Road Ports",
  "address_2": "Apt. 785",
  "locality": "Tamaraburgh",
  "region": "WY",
  "postal_code": "32175-3833",
  "country": "US"
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
  address_id:
    type: string
    description: The address id as a GUID
  user_id:
    type: integer
    description: The user_id the address is for
  address_type:
    type: string
    description: The address type
  address_1:
    type: string
    description: The address 1
  address_2:
    type: string
    description: The address_2
  locality:
    type: string
    description: The locality
  region:
    type: string
    description: The region / state / province
  postal_code:
    type: string
    description: The zip code / postal code
  country:
    type: string
    description: The country code
```
