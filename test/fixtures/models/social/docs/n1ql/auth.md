# Auth Queries

These are example N1QL queries that may can performed to retrieve user auth related data.

---

## Users By Username

The following query will get a User by their Username.

##### Index

[idx\_users\_username.n1ql](idx_users_username.n1ql)

```sql
CREATE INDEX idx_users_username ON social( username, doc_type )
WHERE doc_type = 'user-auth'
USING GSI
```

##### Query

[user\_by\_username.n1ql](queries/users/user_by_username.n1ql)

```sql
SELECT auth.*
FROM social AS auth
WHERE username = 'Aaliyah_Orn23'
    AND doc_type = 'user-auth'
LIMIT 1
```

##### Result

```json
[
  {
    "_id": "user_194_auth",
    "doc_type": "user-auth",
    "password": "vdVjM2DapolueaH",
    "user_id": 194,
    "username": "Aaliyah_Orn23"
  }
]
```

## Users By Username and Password

The following index and query will retrieve a user by their `username` and `password`.

##### Index

The previous index will no longer be used so we need to drop it.

[idx\_users\_username\_drop.n1ql](indexes/idx_users_username_drop.n1ql)

```sql
DROP INDEX social.idx_users_username
```

[idx\_users\_username\_password.n1ql](indexes/idx_users_username_password.n1ql)

```sql
CREATE INDEX idx_users_username_password ON social( username, `password`, doc_type )
WHERE doc_type = 'user-auth'
USING GSI
```

##### Query

[user\_by\_username\_password.n1ql](queries/users/user_by_username_password.n1ql)

```sql
SELECT auth.*
FROM social AS auth
WHERE auth.username = 'Aaliyah_Orn23'
    AND auth.`password` = 'vdVjM2DapolueaH'
    AND auth.doc_type = 'user-auth'
LIMIT 1
```

##### Result

```json
[
  {
    "first_name": "Albin",
    "last_name": "Price",
    "user_id": 197
  }
]
```