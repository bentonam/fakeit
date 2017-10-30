
# Friends Model

### Purpose

This model is used for user friends.

### Example Document

```json
{
  "_id": "user_100_friends",
  "doc_type": "user-friends",
  "user_id": 100,
  "friends": [
    {
      "user_id": 160,
      "date_friended": 1459162839831
    },
    {
      "user_id": 295,
      "date_friended": 1457454991203
    },
    {
      "user_id": 898,
      "date_friended": 1464479886361
    },
    {
      "user_id": 964,
      "date_friended": 1451823513077
    },
    {
      "user_id": 487,
      "date_friended": 1464463636945
    },
    {
      "user_id": 470,
      "date_friended": 1464496606879
    },
    {
      "user_id": 179,
      "date_friended": 1464463688661
    }
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
  friends:
    type: array
    description: An array of friends (user_id)
```
