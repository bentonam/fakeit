
# Chats Model

### Purpose

This model is used for grouping chat messages

### Example Document

```json
{
  "_id": "chat_00016787-d896-5235-92ef-4ff8dd056225",
  "doc_type": "chat",
  "chat_id": "00016787-d896-5235-92ef-4ff8dd056225",
  "created_on": 1464518742983,
  "users": [
    861,
    492
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
  chat_id:
    type: string
    description: The chat id as a GUID
  created_on:
    type: integer
    description: The date of the post
  users:
    type: array
    description: An array of user ids who are in the chat
```
