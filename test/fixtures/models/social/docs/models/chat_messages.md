
# Chat Messages Model

### Purpose

This model is used for chat messages

### Example Document

```json
{
  "_id": "message_00006ed1-97b5-5a8c-9e6c-48c8eba2949e",
  "doc_type": "chat-message",
  "message_id": "00006ed1-97b5-5a8c-9e6c-48c8eba2949e",
  "chat_id": "750d2bd0-2c5a-5f4d-ae53-ba5b006bbc74",
  "user_id": 862,
  "message_date": 1460112821987,
  "message": "Ea et quam. Voluptates similique excepturi laborum pariatur molestiae."
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
  message_id:
    type: string
    description: The message id as a GUID
  chat_id:
    type: string
    description: The message id as a GUID
  user_id:
    type: integer
    description: The user_id that sent the message
  message_date:
    type: integer
    description: The date of the post
  message:
    type: string
    description: The message content

```
