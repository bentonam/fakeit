
# Auth Model

### Purpose

This model is used for user authentication.

### Example Document

```json
{
  "_id": "user_432_auth",
  "doc_type": "user-auth",
  "username": "Koby.Muller",
  "password": "WEuk6vs9YV4THRn",
  "user_id": 432
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
  username:
    type: string
    description: The users username
  password:
    type: string
    description: The users password
  user_id:
    type: integer
    description: The users id
```
