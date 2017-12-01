# Airport Review Queries

These are example N1QL queries that may can performed to retrieve airport review related data.

---

## Airport Reviews By Airport ID

The following queries will return review related information for a given `airport_id`

##### Index

[idx\_airports\_reviews\_airport\_code.n1ql](indexes/idx_airports_reviews_airport_code.n1ql)

```sql
CREATE INDEX idx_airports_reviews_airport_code ON `flight-data`( airport_code, rating, doc_type )
WHERE doc_type = 'airport-review'
USING GSI
```

##### Query

Get all of the reviews for an airport and sort by most recent

[airport\_reviews\_recent.n1ql](queries/airline_reviews/airport_reviews_recent.n1ql)

```sql
SELECT reviews.review_id, reviews.review_title, reviews.rating,
    MILLIS_TO_STR( reviews.review_date, 'yyyy-mm-dd' ) AS review_date,
    users.user_id,
    users.details.first_name || IFNULL( ' ' || SUBSTR( users.details.last_name, 0, 1 ) || '.', '' ) AS reviewer_name
FROM `flight-data` AS reviews
INNER JOIN `flight-data` AS users
    ON KEYS 'user_' || TOSTRING( reviews.user_id )
WHERE reviews.airport_code = 'ICT'
    AND reviews.rating IS NOT NULL
    AND reviews.doc_type = 'airport-review'
ORDER BY reviews.review_date DESC
```


##### Result

```json
[
  {
    "rating": 4,
    "review_date": "2016-05-21T11:58:24.792Z",
    "review_id": "4678c58d-b12d-4e93-9e13-39809ae74c0c",
    "review_title": "Eos voluptates corporis veniam enim molestiae harum vero laborum.",
    "reviewer_name": "Derick",
    "user_id": 3
  },
  {
    "rating": 4,
    "review_date": "2016-05-20T23:27:45.88Z",
    "review_id": "977ad097-9372-4287-b80a-540e57302c45",
    "review_title": "Quo animi et voluptas necessitatibus porro voluptatum amet placeat explicabo.",
    "reviewer_name": "Myrna",
    "user_id": 5675
  },
  {
    "rating": 2,
    "review_date": "2016-04-03T20:16:07.958Z",
    "review_id": "c73dac2d-466a-481c-ad4d-22ef113a4976",
    "review_title": "Et quos earum amet.",
    "reviewer_name": "Leonor S.",
    "user_id": 5693
  }
]
```

##### Query

This query will return the total # of reviews, the average review rating and the best and worst rating.

[airport\_reviews_aggregates.n1ql](queries/airline_reviews/airport_reviews_aggregates.n1ql)

```sql
SELECT COUNT( 1 ) AS total_reviews,
    ROUND( AVG( reviews.rating ), 2 ) AS avg_rating,
    MIN( reviews.rating ) AS worst_rating,
    MAX( reviews.rating ) AS best_rating
FROM `flight-data` AS reviews
WHERE reviews.airport_code = 'JFK'
    AND reviews.rating IS NOT NULL
    AND reviews.doc_type = 'airport-review'
GROUP BY reviews.airport_id
```

##### Result

Both queries output the same exact results.

```json
[
  {
    "avg_rating": 3.4,
    "best_rating": 5,
    "total_reviews": 10,
    "worst_rating": 1
  }
]
```

### User Airport Reviews by User ID

The following indexes and queries show to retrieve which reviews for an airport a user has submitted based on their `user_id`.

##### Index

[idx\_airports\_reviews\_user\_id.n1ql](indexes/idx_airports_reviews_user_id.n1ql)

```sql
CREATE INDEX idx_airports_reviews_user_id ON `flight-data`( user_id, airport_code, doc_type )
WHERE doc_type = 'airport-review'
USING GSI
```

##### Query

[airport\_reviews\_by\_user\_id.n1ql](queries/airline_reviews/airport_reviews_by_user_id.n1ql)

```sql
SELECT reviews.review_id, reviews.review_title, reviews.rating,
    MILLIS_TO_STR( reviews.review_date ) AS review_date,
    IFNULL( airports.airport_iata, airports.airport_icao, airports.airport_ident ) AS airport_code,
    airports.airport_name
FROM `flight-data` AS reviews
INNER JOIN `flight-data` AS codes
    ON KEYS 'airport_code_' || reviews.airport_code
INNER JOIN `flight-data` AS airports
    ON KEYS 'airport_' || TOSTRING( codes.id )
WHERE reviews.user_id = 2097
    AND reviews.doc_type = 'airport-review'
ORDER BY reviews.review_date DESC
```

##### Results

```json
[
  {
    "airport_code": "GFY",
    "airport_name": "Grootfontein",
    "rating": 5,
    "review_date": "2016-05-21T16:04:42.8Z",
    "review_id": "c2fb0aa5-d6fa-4559-b24d-1614d0fd7aa2",
    "review_title": "Nam eveniet autem consequatur."
  },
  {
    "airport_code": "DIL",
    "airport_name": "Presidente Nicolau Lobato Intl",
    "rating": 2,
    "review_date": "2016-05-21T11:55:40.096Z",
    "review_id": "7e88b938-5c3b-4147-8a48-8166f43496d5",
    "review_title": "A quod molestiae."
  },
  {
    "airport_code": "BAQ",
    "airport_name": "Ernesto Cortissoz",
    "rating": 2,
    "review_date": "2016-05-21T07:23:24.711Z",
    "review_id": "64e9de0f-3166-4abd-ab54-8a40a44d6ff1",
    "review_title": "Ut consectetur voluptatibus non odit ratione."
  },
  {
    "airport_code": "ILU",
    "airport_name": "Kilaguni",
    "rating": 5,
    "review_date": "2016-05-21T00:50:57.329Z",
    "review_id": "32e8d390-c4b5-4466-a71c-53bcc63e6731",
    "review_title": "Eum quam blanditiis voluptas debitis sit magni porro voluptatum."
  },
  {
    "airport_code": "KCM",
    "airport_name": "Kahramanmaras Airport",
    "rating": 2,
    "review_date": "2016-05-20T22:30:57.84Z",
    "review_id": "304ecaa4-1314-46e7-8606-c03f0a9013b3",
    "review_title": "Nemo at et est quod iste distinctio esse."
  }
]
```
