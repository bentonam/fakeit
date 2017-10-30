# Address Queries

These are example N1QL queries that may can performed to retrieve address related data.

---

## Address By ID

The following query will get an Address by its Document ID.

##### Query

[address\_by\_document\_id.n1ql](queries/addresses/address_by_document_id.n1ql)

```sql
SELECT addresses.*
FROM social AS addresses
USE KEYS 'address_00074370-4c19-5020-8437-c7d4301626fa'
```

##### Result

```json
[
  {
    "_id": "address_00074370-4c19-5020-8437-c7d4301626fa",
    "address_1": "4675 Cullen Coves Mews",
    "address_2": null,
    "address_id": "00074370-4c19-5020-8437-c7d4301626fa",
    "address_type": "Work",
    "country": "KR",
    "doc_type": "address",
    "locality": "Tremblaystad",
    "postal_code": "92906-4059",
    "region": "CA",
    "user_id": 907
  }
]
```

The following query will retrieve multiple Addresses by their Document ID.

##### Query

[addresses\_by\_document\_ids.n1ql](queries/addresses/addresses_by_document_ids.n1ql)

```sql
SELECT addresses.*
FROM social AS addresses
USE KEYS [
    'address_675a5d4c-9e79-5a9f-a9c5-6c9b8cca7dbc',
    'address_bccbed78-04da-5485-8a95-1fd5f2d5c3d4',
    'address_0a45a305-fddd-5799-a6b2-542eb4d110f5'
]
```

##### Result

```json
[
  {
    "_id": "address_675a5d4c-9e79-5a9f-a9c5-6c9b8cca7dbc",
    "address_1": "5137 Brakus Spur Mission",
    "address_2": null,
    "address_id": "675a5d4c-9e79-5a9f-a9c5-6c9b8cca7dbc",
    "address_type": "Home",
    "country": "YE",
    "doc_type": "address",
    "locality": "Weimannmouth",
    "postal_code": "24160",
    "region": "WY",
    "user_id": 153
  },
  {
    "_id": "address_bccbed78-04da-5485-8a95-1fd5f2d5c3d4",
    "address_1": "888 Borer Skyway Stravenue",
    "address_2": null,
    "address_id": "bccbed78-04da-5485-8a95-1fd5f2d5c3d4",
    "address_type": "Work",
    "country": "IS",
    "doc_type": "address",
    "locality": "New Timmyside",
    "postal_code": "16787-6090",
    "region": "ME",
    "user_id": 153
  },
  {
    "_id": "address_0a45a305-fddd-5799-a6b2-542eb4d110f5",
    "address_1": "84098 Emma Forest Rest",
    "address_2": "Suite 614",
    "address_id": "0a45a305-fddd-5799-a6b2-542eb4d110f5",
    "address_type": "Other",
    "country": "BQ",
    "doc_type": "address",
    "locality": "West Lindsey",
    "postal_code": "80136-3767",
    "region": "MI",
    "user_id": 153
  }
]
```

---

## User Addresses

Get all of the user addresses and return them as individual records

##### Query

[user\_addresses\_flattended.n1ql](queries/addresses/user_addresses_flattended.n1ql)

```sql
SELECT addresses.*
FROM social AS users
USE KEYS 'user_123'
INNER JOIN social AS address_lookup ON KEYS 'user_' || TOSTRING(users.user_id) || '_addresses'
UNNEST address_lookup.addresses AS address_id
INNER JOIN social AS addresses ON KEYS 'address_' || address_id
```

##### Result

```json
[
  {
    "_id": "address_0a181fa4-b367-57c3-b218-a6188a9f0856",
    "address_1": "1083 Mayert Light Ville",
    "address_2": "Apt. 996",
    "address_id": "0a181fa4-b367-57c3-b218-a6188a9f0856",
    "address_type": "Other",
    "country": "SM",
    "doc_type": "address",
    "locality": "Dickinsonborough",
    "postal_code": "07192-1503",
    "region": "KS",
    "user_id": 123
  },
  {
    "_id": "address_d1ebe4b1-2595-58d1-94bb-4c1e1e800429",
    "address_1": "477 Letha Trail Ways",
    "address_2": null,
    "address_id": "d1ebe4b1-2595-58d1-94bb-4c1e1e800429",
    "address_type": "Other",
    "country": "JP",
    "doc_type": "address",
    "locality": "Port Andreane",
    "postal_code": "67615-8023",
    "region": "GA",
    "user_id": 123
  },
  {
    "_id": "address_f6da3d5c-ffae-5a2e-a62f-696bf93a683f",
    "address_1": "45989 Fiona Road Ports",
    "address_2": "Apt. 785",
    "address_id": "f6da3d5c-ffae-5a2e-a62f-696bf93a683f",
    "address_type": "Work",
    "country": "CL",
    "doc_type": "address",
    "locality": "Tamaraburgh",
    "postal_code": "32175-3833",
    "region": "WY",
    "user_id": 123
  }
]
```

---

## User with Nested Addresses

We want to get the user information, with all of their addresses returned (*if any*) as an array.

##### Query

[user\_addresses\_nested.n1ql](queries/addresses/user_addresses_nested.n1ql)

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
    END AS addresses
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
```

##### Result

```json
[
  {
    "addresses": [
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
      },
      {
        "address_1": "477 Letha Trail Ways",
        "address_2": null,
        "country": "JP",
        "locality": "Port Andreane",
        "postal_code": "67615-8023",
        "region": "GA"
      }
    ],
    "first_name": "Ernesto",
    "last_name": "Bins",
    "user_id": 123
  }
]
```