# Email Queries

These are example N1QL queries that may can performed to retrieve email related data.

---

## Email By ID

The following query will get an Email by its Document ID.

##### Query

[email\_by\_document\_id.n1ql](queries/emails/email_by_document_id.n1ql)

```sql
SELECT emails.*
FROM social AS emails
USE KEYS 'email_3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b'
```

##### Result

```json
[
  {
    "_id": "email_3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
    "doc_type": "email",
    "email_address": "Okey88@gmail.com",
    "email_id": "3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
    "email_type": "Other",
    "user_id": 123
  }
]
```

The following query will retrieve multiple Emails by their Document ID.

##### Query

[emails\_by\_document\_id.n1ql](queries/emails/emails_by_document_id.n1ql)

```sql
SELECT emails.*
FROM social AS emails
USE KEYS [
    'email_3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b',
    'email_effa49ab-25e0-553a-a934-da5cc7654ef1',
    'email_6c9c825a-981d-56fc-a15c-770dfa773c3b',
    'email_46b81f00-dd2b-5d77-9405-5be152833536'
]
```

##### Result

```json
[
  {
    "_id": "email_3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
    "doc_type": "email",
    "email_address": "Okey88@gmail.com",
    "email_id": "3dffcff4-fd4f-5e92-8f97-ea8bd3d71a5b",
    "email_type": "Other",
    "user_id": 123
  },
  {
    "_id": "email_effa49ab-25e0-553a-a934-da5cc7654ef1",
    "doc_type": "email",
    "email_address": "Mireille_Nicolas30@yahoo.com",
    "email_id": "effa49ab-25e0-553a-a934-da5cc7654ef1",
    "email_type": "Home",
    "user_id": 123
  },
  {
    "_id": "email_6c9c825a-981d-56fc-a15c-770dfa773c3b",
    "doc_type": "email",
    "email_address": "Brannon38@gmail.com",
    "email_id": "6c9c825a-981d-56fc-a15c-770dfa773c3b",
    "email_type": "Home",
    "user_id": 123
  },
  {
    "_id": "email_46b81f00-dd2b-5d77-9405-5be152833536",
    "doc_type": "email",
    "email_address": "Aliya_Hettinger@hotmail.com",
    "email_id": "46b81f00-dd2b-5d77-9405-5be152833536",
    "email_type": "Home",
    "user_id": 123
  }
]
```

---

## User Emails

Get all of the user emails and return them as individual records

##### Query

[emails\_flattended.n1ql](queries/emails/emails_flattended.n1ql)

```sql
SELECT emails.*
FROM social AS users
USE KEYS 'user_439'
INNER JOIN social AS email_lookup ON KEYS 'user_' || TOSTRING(users.user_id) || '_emails'
UNNEST email_lookup.emails AS email_id
INNER JOIN social AS emails ON KEYS 'email_' || email_id
```

##### Result

```json
[
  {
    "_id": "email_b464780b-c456-57da-be3e-a1714267c54e",
    "doc_type": "email",
    "email_address": "Jaclyn_Schoen70@gmail.com",
    "email_id": "b464780b-c456-57da-be3e-a1714267c54e",
    "email_type": "Home",
    "user_id": 439
  },
  {
    "_id": "email_af93b95d-b79d-5754-9840-c57ca5a0d6ff",
    "doc_type": "email",
    "email_address": "Ida17@yahoo.com",
    "email_id": "af93b95d-b79d-5754-9840-c57ca5a0d6ff",
    "email_type": "Work",
    "user_id": 439
  },
  {
    "_id": "email_95e45cde-07b3-5894-83d1-8a1a955d02b9",
    "doc_type": "email",
    "email_address": "Juanita15@hotmail.com",
    "email_id": "95e45cde-07b3-5894-83d1-8a1a955d02b9",
    "email_type": "Other",
    "user_id": 439
  }
]
```

---

## User with Nested Emails

We want to get the user information, with all of their emails returned (*if any*) as an array.

##### Query

[emails\_nested.n1ql](queries/emails/emails_nested.n1ql)

```sql
SELECT u.user_id, u.first_name, u.last_name,
    ARRAY
        email.email_address FOR email IN IFMISSING(emails, [])
    END AS emails
FROM social AS u
USE KEYS 'user_123'
LEFT NEST social AS emails ON KEYS (
    ARRAY a.email_id FOR a IN (
        SELECT 'email_' || email_id AS email_id
        FROM social AS email_lookup
        USE KEYS 'user_' || TOSTRING(u.user_id) || '_emails'
        UNNEST email_lookup.emails AS email_id
    ) END
)
```

##### Result

```json
[
  {
    "emails": [
      "Brannon38@gmail.com",
      "Mireille_Nicolas30@yahoo.com",
      "Aliya_Hettinger@hotmail.com",
      "Okey88@gmail.com"
    ],
    "first_name": "Ernesto",
    "last_name": "Bins",
    "user_id": 123
  }
]
```