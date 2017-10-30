
# Phones Model

### Purpose

This model represents a single phone number.

### Example Document

```json
{
  "_id": "phone_846eb522-51cf-5b8f-8442-b4dce2e79f3f",
  "doc_type": "phone",
  "phone_id": "846eb522-51cf-5b8f-8442-b4dce2e79f3f",
  "user_id": 123,
  "phone_type": "Main",
  "phone_number": "126.981.5326",
  "extension": null
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
  phone_id:
    type: string
    description: The phone id as a GUID
  user_id:
    type: integer
    description: The user_id the phone is for
  phone_type:
    type: string
    description: The phone type
  phone_number:
    type: string
    description: The phone number
  extension:
    type: string
    description: The phone extension
```
