# Airline Review Queries

These are example N1QL queries that may can performed to retrieve airline review related data.

---

## Airline Reviews By Airline ID

The following queries will return review related information for a given `airline_id`

##### Index

[idx\_airlines\_reviews\_airline\_code.n1ql](indexes/idx_airlines_reviews_airline_code.n1ql)

```sql
CREATE INDEX idx_airlines_reviews_airline_code ON `flight-data`( airline_code, rating, doc_type )
WHERE doc_type = 'airline-review'
USING GSI
```

##### Query

Get all of the reviews for an airline and sort by most recent

[airline\_reviews\_recent.n1ql](queries/airline_reviews/airline_reviews_recent.n1ql)

```sql
SELECT reviews.review_id, reviews.review_title, reviews.rating,
    MILLIS_TO_STR( reviews.review_date, 'yyyy-mm-dd' ) AS review_date,
    users.user_id,
    users.details.first_name || IFNULL( ' ' || SUBSTR( users.details.last_name, 0, 1 ) || '.', '' ) AS reviewer_name
FROM `flight-data` AS reviews
INNER JOIN `flight-data` AS users
    ON KEYS 'user_' || TOSTRING( reviews.user_id )
WHERE reviews.airline_code = 'AA'
    AND reviews.rating IS NOT NULL
    AND reviews.doc_type = 'airline-review'
ORDER BY reviews.review_date DESC
```


##### Result

```json
[
  {
    "rating": 5,
    "review_date": "2016-05-21T10:30:22.42Z",
    "review_id": "aa4763eb-402f-4be8-a46d-da8f0a639f37",
    "review_title": "Sunt eius sint.",
    "reviewer_name": "Abigale L.",
    "user_id": 3163
  },
  {
    "rating": 1,
    "review_date": "2016-05-21T01:12:22.982Z",
    "review_id": "85394e70-2be6-4e6e-bdcd-096965b622d7",
    "review_title": "Nemo vitae quia et atque incidunt velit maiores expedita.",
    "reviewer_name": "Benjamin",
    "user_id": 2908
  },
  {
    "rating": 2,
    "review_date": "2016-05-20T21:32:09.35Z",
    "review_id": "e6d5d619-3b68-43bc-9a82-cf3cd511c51f",
    "review_title": "Architecto iste et.",
    "reviewer_name": "Percy",
    "user_id": 8148
  },
  {
    "rating": 4,
    "review_date": "2016-05-11T21:45:09.887Z",
    "review_id": "f0daff0a-952e-4aa1-896d-f7264bafdd89",
    "review_title": "Aliquam omnis dolorem deserunt aut velit impedit consequuntur dolorem.",
    "reviewer_name": "Cecile T.",
    "user_id": 1023
  }
]
```

##### Query

This query will return the total # of reviews, the average review rating and the best and worst rating.

[airline\_reviews\_aggregates.n1ql](queries/airline_reviews/airline_reviews_aggregates.n1ql)

```sql
SELECT COUNT( 1 ) AS total_reviews,
    ROUND( AVG( reviews.rating ), 2 ) AS avg_rating,
    MIN( reviews.rating ) AS worst_rating,
    MAX( reviews.rating ) AS best_rating
FROM `flight-data` AS reviews
WHERE reviews.airline_code = 'AE'
    AND reviews.rating IS NOT NULL
    AND reviews.doc_type = 'airline-review'
GROUP BY reviews.airline_id
```

##### Result

```json
[
  {
    "avg_rating": 3.2,
    "best_rating": 5,
    "total_reviews": 10,
    "worst_rating": 1
  }
]
```

### User Airline Reviews

The following indexes and queries show to retrieve which reviews for an airline a user has submitted.

##### Index

[idx\_airlines\_reviews\_user\_id.n1ql](indexes/idx_airlines_reviews_user_id.n1ql)

```sql
CREATE INDEX idx_airlines_reviews_user_id ON `flight-data`( user_id, airline_code, doc_type )
WHERE doc_type = 'airline-review'
USING GSI
```

##### Query

[airline\_reviews\_by\_user\_id.n1ql](queries/airline_reviews/airline_reviews_by_user_id.n1ql)

```sql
SELECT reviews.review_id, reviews.review_title, reviews.rating,
    MILLIS_TO_STR( reviews.review_date ) AS review_date,
    IFNULL( airlines.airline_iata, airlines.airline_icao ) AS airline_code,
    airlines.airline_name
FROM `flight-data` AS reviews
INNER JOIN `flight-data` AS airlines
    ON KEYS 'airline_' || TOSTRING( reviews.airline_id )
WHERE reviews.user_id = 2090
    AND reviews.doc_type = 'airline-review'
ORDER BY reviews.review_date DESC
```

##### Results

```json
[
  {
    "airline_code": "TMS",
    "airline_name": "Temsco Helicopters",
    "rating": 3,
    "review_date": "2016-05-21T17:39:41.692Z",
    "review_id": "ef52b510-a03a-4564-90a9-00709d3f4784",
    "review_title": "Eveniet ratione autem voluptas mollitia dolore."
  },
  {
    "airline_code": "RDE",
    "airline_name": "II Lione Alato Arl",
    "rating": 4,
    "review_date": "2016-05-21T12:37:34.683Z",
    "review_id": "a11b5803-d598-4234-b02a-25f8bd61d37b",
    "review_title": "Consequatur esse alias et est impedit aperiam ipsum illo delectus."
  },
  {
    "airline_code": "LTS",
    "airline_name": "Flight Inspections and Systems",
    "rating": 5,
    "review_date": "2016-05-21T10:05:52.907Z",
    "review_id": "99b749a2-7ceb-4d49-8353-181582307690",
    "review_title": "Dolorem quis quod."
  },
  {
    "airline_code": "KDA",
    "airline_name": "Kendell Airlines",
    "rating": 1,
    "review_date": "2016-05-21T04:09:36.975Z",
    "review_id": "bc3b2c37-d8c4-4385-b93e-d1342d1a7cb3",
    "review_title": "Et nulla nisi nam voluptatibus nam."
  },
  {
    "airline_code": "SMH",
    "airline_name": "Smithair",
    "rating": 3,
    "review_date": "2016-05-20T19:53:22.862Z",
    "review_id": "177fb266-cd76-469d-a887-efc883a247b8",
    "review_title": "Enim autem dolore alias."
  },
  {
    "airline_code": "KOK",
    "airline_name": "Horizon Air Service",
    "rating": 5,
    "review_date": "2015-10-14T07:28:25.336Z",
    "review_id": "dff9774e-9488-4066-9156-143fffc02515",
    "review_title": "Delectus odio est itaque consequatur dolores deleniti non."
  },
  {
    "airline_code": "AIV",
    "airline_name": "Airvias S/A Linhas Aereas",
    "rating": 2,
    "review_date": "2015-08-20T07:04:05.259Z",
    "review_id": "5b58e48d-ff79-4f05-ad70-023a79aa46fc",
    "review_title": "Iure delectus est quidem harum in sit nemo."
  }
]
```
