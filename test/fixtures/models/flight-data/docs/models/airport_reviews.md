
# Airport Reviews Model

### Example Document

```json
{
  "_id": "airport_3605_review_c73dac2d-466a-481c-ad4d-22ef113a4976",
  "airport_code": "ICT",
  "airport_id": 3605,
  "doc_type": "airport-review",
  "rating": 2,
  "review_body": "Reprehenderit ea non laudantium voluptatem. Facere perspiciatis recusandae quia consectetur dolor possimus. Impedit provident recusandae nisi.\n \rVoluptatum aspernatur velit. Animi omnis autem rem odio voluptatem quia voluptas quibusdam. Blanditiis voluptatem deserunt totam nemo corrupti molestias eum ullam nostrum. Nobis nulla rerum quod et ab asperiores ea. Laborum iure est. Ipsa sed repellat aut.\n \rDicta nulla autem voluptatem. Tempora consequatur sapiente optio iusto. A voluptates aut. Qui tempora officiis possimus facilis nobis amet enim consequatur distinctio. Est iure impedit atque quidem voluptate totam pariatur. Illo et consequuntur eum molestiae eligendi quia provident earum cumque.",
  "review_date": 1459714567958,
  "review_id": "c73dac2d-466a-481c-ad4d-22ef113a4976",
  "review_title": "Et quos earum amet.",
  "user_id": 5693
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
  review_id:
    type: string
    description: Unique identifier representing a specific review
  airport_id:
    type: integer
    description: The airport_id the review is for
  airport_code:
    type: integer
    description: The airports IATA, ICAO or Ident code
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
