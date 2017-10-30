
# Users Phones Model

### Purpose

This model represents all of the phones associated to a given user by maintaining an array of `phone_id`s.

### Example Document

```json
{
  "_id": "user_123_phones",
  "doc_type": "user-phones",
  "user_id": 123,
  "phones": [
    "674b4372-6682-5a96-a12e-9cca04837e0b",
    "ddd7ab98-874c-55e1-9210-e96c91c6c9f9",
    "84c3c48c-5c35-5423-80cc-f10a5107a841",
    "846eb522-51cf-5b8f-8442-b4dce2e79f3f",
    "d1a47aa9-1b83-5f1c-99ed-9330288e288a",
    "35fe173f-b500-5d37-8274-400b683fd19c"
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
  phones:
    type: array
    description: An array of phone_ids
```
