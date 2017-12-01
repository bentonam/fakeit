
# Users Emails Model

### Purpose

This model represents all of the emails associated to a given user by maintaining an array of `email_id`s.

### Example Document

```json
{
  "_id": "user_123_emails",
  "doc_type": "user-emails",
  "user_id": 123,
  "emails": [
    "3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
    "effa49ab-25e0-553a-a934-da5cc7654ef1",
    "6c9c825a-981d-56fc-a15c-770dfa773c3b",
    "46b81f00-dd2b-5d77-9405-5be152833536"
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
  emails:
    type: array
    description: An array of email_ids
```
