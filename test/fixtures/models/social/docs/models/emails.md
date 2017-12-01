
# Emails Model

### Purpose

This model represents a single email address.

### Example Document

```json
{
  "_id": "email_3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
  "doc_type": "email",
  "email_id": "3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
  "user_id": 123,
  "email_type": "Other",
  "email_address": "Okey88@gmail.com"
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
  email_id:
    type: string
    description: The email id as a UUID
  user_id:
    type: integer
    description: The user_id the email is for
  email_type:
    type: string
    description: The phone type
  email_address:
    type: string
    description: The email address
```
