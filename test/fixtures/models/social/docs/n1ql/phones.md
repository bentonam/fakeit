# Phone Queries

These are example N1QL queries that may can performed to retrieve phone related data.

---

## Phone By ID

The following query will get an Phone by its Document ID.

##### Query

[phone\_by\_document\_id.n1ql](queries/phones/phone_by_document_id.n1ql)

```sql
SELECT phones.*
FROM social AS phones
USE KEYS 'phone_cd10cb46-6274-5d57-8411-ed4c32432f42'
```

##### Result

```json
[
  {
    "_id": "phone_cd10cb46-6274-5d57-8411-ed4c32432f42",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "cd10cb46-6274-5d57-8411-ed4c32432f42",
    "phone_number": "302-767-8565",
    "phone_type": "Work",
    "user_id": 743
  }
]
```

The following query will retrieve multiple Phones by their Document ID.

##### Query

[phones\_by\_document\_id.n1ql](queries/phones/phones_by_document_id.n1ql)

```sql
SELECT phones.*
FROM social AS phones
USE KEYS [
    'phone_cd10cb46-6274-5d57-8411-ed4c32432f42',
    'phone_898a93fa-a021-5335-be11-cd19dc49b9c2'
]
```

##### Result

```json
[
  {
    "_id": "phone_cd10cb46-6274-5d57-8411-ed4c32432f42",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "cd10cb46-6274-5d57-8411-ed4c32432f42",
    "phone_number": "302-767-8565",
    "phone_type": "Work",
    "user_id": 743
  },
  {
    "_id": "phone_898a93fa-a021-5335-be11-cd19dc49b9c2",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "898a93fa-a021-5335-be11-cd19dc49b9c2",
    "phone_number": "(246) 549-3051",
    "phone_type": "Home",
    "user_id": 743
  }
]
```

---

## User Phones

Get all of the user phones and return them as individual records

##### Query

[user\_phones\_flattend.n1ql](queries/phones/phones_by_document_id.n1ql)

```sql
SELECT phones.*
FROM social AS users
USE KEYS 'user_439'
INNER JOIN social AS phone_lookup ON KEYS 'user_' || TOSTRING(users.user_id) || '_phones'
UNNEST phone_lookup.phones AS phone_id
INNER JOIN social AS phones ON KEYS 'phone_' || phone_id
```

##### Result

```json
[
  {
    "_id": "phone_64504bdb-ee7d-5773-ab85-4fc7ce66d707",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "64504bdb-ee7d-5773-ab85-4fc7ce66d707",
    "phone_number": "586.813.7230",
    "phone_type": "Work",
    "user_id": 439
  },
  {
    "_id": "phone_d1d4a804-dc1c-5587-9a28-f25d1fab55d3",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "d1d4a804-dc1c-5587-9a28-f25d1fab55d3",
    "phone_number": "1-980-145-1878",
    "phone_type": "Main",
    "user_id": 439
  },
  {
    "_id": "phone_0a3bede6-fa25-5e54-8291-31b3e5647352",
    "doc_type": "phone",
    "extension": null,
    "phone_id": "0a3bede6-fa25-5e54-8291-31b3e5647352",
    "phone_number": "629-175-9427",
    "phone_type": "Work",
    "user_id": 439
  }
]
```

---

## User with Nested Phones

We want to get the user information, with all of their phones returned (*if any*) as an array.

##### Query

[user\_phones\_nested.n1ql](queries/phones/user_phones_nested.n1ql)

```sql
SELECT u.user_id, u.first_name, u.last_name,
    ARRAY
        phone.phone_number || IFNULL(' x' || phone.extension, '')
        FOR phone IN IFMISSING(phones, [])
    END AS phones
FROM social AS u
USE KEYS 'user_419'
LEFT NEST social AS phones ON KEYS (
    ARRAY a.phone_id FOR a IN (
        SELECT 'phone_' || phone_id AS phone_id
        FROM social AS phone_lookup
        USE KEYS 'user_' || TOSTRING(u.user_id) || '_phones'
        UNNEST phone_lookup.phones AS phone_id
    ) END
)
```

##### Result

```json
[
  {
    "first_name": "Esta",
    "last_name": "Heller",
    "phones": [
      "1-630-026-3275",
      "306-640-8827",
      "128.152.1120 x6483",
      "008-171-0056",
      "1-286-772-4984"
    ],
    "user_id": 419
  }
]
```