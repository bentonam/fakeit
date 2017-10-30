
# Airport Reviews Model

### Example Document

```json
[
  {
    "_id": "airline_24_review_85394e70-2be6-4e6e-bdcd-096965b622d7",
    "airline_code": "AA",
    "airline_id": 24,
    "doc_type": "airline-review",
    "rating": 1,
    "review_body": "Aut officiis rerum consequuntur voluptatem. Rerum et dignissimos omnis ut. Qui sequi aperiam ratione aut temporibus et. Dignissimos adipisci et dolores.\n \rNumquam non ut fugit est alias ipsa sunt id. Qui qui sint voluptatem facilis. Quia dolorem nulla error placeat est. Explicabo tenetur porro voluptas tenetur qui dolores fugit.\n \rEt ut voluptas sed placeat voluptates repellat et et. Doloremque est quae quod quis nobis. Quia et reiciendis qui quod et laborum. Ut at esse quas voluptatem enim labore laudantium inventore voluptas. Illo et et autem aut exercitationem sint sed deserunt.",
    "review_date": 1463793142982,
    "review_id": "85394e70-2be6-4e6e-bdcd-096965b622d7",
    "review_title": "Nemo vitae quia et atque incidunt velit maiores expedita.",
    "user_id": 2908
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
  review_id:
    type: string
    description: Unique identifier representing a specific review
  airline_id:
    type: integer
    description: The airline_id the review is for
  airline_code:
    type: string
    description: The airlines IATA or ICAO code
  user_id:
    type: integer
    description: The user_id of the user who wrote the review
  rating:
    type: integer
    description: The review rating
  review_title:
    type: string
    description: The review title
  review_body:
    type: string
    description: The review content
  review_date:
    type: integer
    description: The review content
```
