
# Users Model

### Purpose

This model represents a single user.

### Example Document

```json
{
  "_id": "user_123",
  "doc_type": "user",
  "user_id": 123,
  "first_name": "Ernesto",
  "last_name": "Bins",
  "username": "Lance.Kuhlman70",
  "password": "AMhOoQ9NZVzrxGj",
  "created_on": 1433854267000
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
    description: The users id
  first_name:
    type: string
    description: The users first name
  last_name:
    type: string
    description: The users last name
  username:
    type: string
    description: The users username
  password:
    type: string
    description: The users password
  created_on:
    type: integer
    description: An epoch time of when the user was created
```
