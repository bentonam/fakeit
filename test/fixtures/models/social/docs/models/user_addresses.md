
# Users Addresses Model

### Purpose

This model represents all of the addresses associated to a given user by maintaining an array of `address_id`s.

### Example Document

```json
{
  "_id": "user_123_addresses",
  "doc_type": "user-addresses",
  "user_id": 123,
  "addresses": [
    "0a181fa4-b367-57c3-b218-a6188a9f0856",
    "d1ebe4b1-2595-58d1-94bb-4c1e1e800429",
    "f6da3d5c-ffae-5a2e-a62f-696bf93a683f"
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
  doc_type:
    type: string
    description: The document type
  user_id:
    type: integer
    description: The user_id the lookup is for
  addresses:
    type: array
    description: An array of address_ids
```
