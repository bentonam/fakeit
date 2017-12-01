# User Queries

These are example N1QL queries that may can performed to retrieve user related data.

---

## User By ID

The following query will get an User by its Document ID.

##### Query

[user\_by\_document\_id.n1ql](queries/users/user_by_document_id.n1ql)

```sql
SELECT users.*
FROM social AS users
USE KEYS 'user_354'
```

##### Result

```json
[
  {
    "_id": "user_354",
    "created_on": 1460452930000,
    "doc_type": "user",
    "first_name": "Randy",
    "last_name": "Thompson",
    "password": "NrvGJjWhRbj4bCc",
    "user_id": 354,
    "username": "Gabe_Jast"
  }
]
```

The following query will retrieve multiple Users by their Document ID.

##### Query

[users\_by\_document\_id.n1ql](queries/users/users_by_document_id.n1ql)

```sql
SELECT users.*
FROM social AS users
USE KEYS [
    'user_453',
    'user_267',
    'user_621'
]
```

##### Result

```json
[
  {
    "_id": "user_453",
    "created_on": 1442166245000,
    "doc_type": "user",
    "first_name": "Ferne",
    "last_name": "Pagac",
    "password": "tTX_6LBk2pii1GH",
    "user_id": 453,
    "username": "Collin25"
  },
  {
    "_id": "user_267",
    "created_on": 1445026370000,
    "doc_type": "user",
    "first_name": "Will",
    "last_name": "Schowalter",
    "password": "YyK90oo1LWsU8wP",
    "user_id": 267,
    "username": "Gretchen21"
  },
  {
    "_id": "user_621",
    "created_on": 1452191348000,
    "doc_type": "user",
    "first_name": "Stacey",
    "last_name": "Gerlach",
    "password": "hUlPhnO0HaPL6nF",
    "user_id": 621,
    "username": "Maryjane.Williamson"
  }
]
```

---

## User with Nested Addresses, Emails and Phones

We want to get the user information, with all of their phones returned (*if any*) as an array.

##### Query

[user\_with\_addresses\_emails\_phones.n1ql](queries/users/user_with_addresses_emails_phones.n1ql)

```sql
SELECT u.user_id, u.first_name, u.last_name,
    ARRAY {
            "address_1": address.address_1,
            "address_2": address.address_2,
            "region": address.region,
            "country": address.country,
            "postal_code": address.postal_code,
            "locality": address.locality
        } FOR address IN IFMISSING(addresses, [])
    END AS addresses,
    ARRAY
        email.email_address FOR email IN IFMISSING(emails, [])
    END AS emails,
    ARRAY
        phone.phone_number || IFMISSINGORNULL(' x' || phone.extension, '')
        FOR phone IN IFMISSING(phones, [])
    END AS phones
FROM social AS u
USE KEYS 'user_123'
LEFT NEST social AS addresses ON KEYS (
    ARRAY a.address_id FOR a IN (
        SELECT 'address_' || address_id AS address_id
        FROM social AS address_lookup
        USE KEYS 'user_' || TOSTRING(u.user_id) || '_addresses'
        UNNEST address_lookup.addresses AS address_id
    ) END
)
LEFT NEST social AS emails ON KEYS (
    ARRAY a.email_id FOR a IN (
        SELECT 'email_' || email_id AS email_id
        FROM social AS email_lookup
        USE KEYS 'user_' || TOSTRING(u.user_id) || '_emails'
        UNNEST email_lookup.emails AS email_id
    ) END
)
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
    "addresses": [
      {
        "address_1": "477 Letha Trail Ways",
        "address_2": null,
        "country": "JP",
        "locality": "Port Andreane",
        "postal_code": "67615-8023",
        "region": "GA"
      },
      {
        "address_1": "1083 Mayert Light Ville",
        "address_2": "Apt. 996",
        "country": "SM",
        "locality": "Dickinsonborough",
        "postal_code": "07192-1503",
        "region": "KS"
      },
      {
        "address_1": "45989 Fiona Road Ports",
        "address_2": "Apt. 785",
        "country": "CL",
        "locality": "Tamaraburgh",
        "postal_code": "32175-3833",
        "region": "WY"
      }
    ],
    "emails": [
      "Mireille_Nicolas30@yahoo.com",
      "Okey88@gmail.com",
      "Brannon38@gmail.com",
      "Aliya_Hettinger@hotmail.com"
    ],
    "first_name": "Ernesto",
    "last_name": "Bins",
    "phones": [
      "1-109-634-9724",
      "1-253-939-1796 x5190",
      "(617) 519-5316",
      "655.198.0921",
      "126.981.5326",
      "(385) 403-9048"
    ],
    "user_id": 123
  }
]
```