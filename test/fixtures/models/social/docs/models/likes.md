
# Likes Model

### Purpose

This model is used for tracking post likes.

### Example Document

```json
[
  {
    "_id": "like_00000b2b-2c32-55f2-b9b4-b617943d0e1d",
    "doc_type": "like",
    "like_date": 1440970586971,
    "like_id": "00000b2b-2c32-55f2-b9b4-b617943d0e1d",
    "post_id": "d00648ea-4cfc-5f5a-b921-1aa6127ba2eb",
    "user_id": 184
  }
]
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
  like_id:
    type: string
    description: The post id as a GUID
  post_id:
    type: string
    description: The post id as a GUID
  user_id:
    type: integer
    description: The user_id that liked the post
  like_date:
    type: integer
    description: The date of the like
```
