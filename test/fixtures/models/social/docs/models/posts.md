
# Posts Model

### Purpose

This model is used for user posts

### Example Document

```json
{
  "_id": "post_000209da-caaf-5ae4-bbe7-7983b44a9970",
  "doc_type": "post",
  "post_id": "000209da-caaf-5ae4-bbe7-7983b44a9970",
  "user_id": 949,
  "post_date": 1464475644216,
  "post": "Debitis ea reiciendis sed cumque voluptatibus eveniet modi numquam. Deserunt nesciunt quidem voluptatem modi nam. Quaerat qui omnis et quisquam libero ipsam voluptas ipsa. Autem exercitationem quia voluptatem et perferendis quia. Qui debitis quaerat consequatur libero.",
  "visibility": "public",
  "post_access": []
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
  post_id:
    type: string
    description: The post id as a GUID
  user_id:
    type: integer
    description: The user_id that made the post
  post_date:
    type: integer
    description: The date of the post
  post:
    type: string
    description: The post content
  visibility:
    type: string
    description: The post visibility
  post_access:
    type: array
    description: An array of users who can see the post if the visibility is private
```
