It is assumed that you have imported this entire dataset into a Couchbase bucket named `social`.  The following [N1QL](http://www.couchbase.com/n1ql) queries have been provided as an example of how to query the social dataset.  These indexes and queries are provided for example purposes only.  Pull Requests are welcome, if you see any issues or would like to add your own examples.


## Overview

Be sure to familiarize yourself with each of the available [models](models/) in the Users dataset.

If we were to attempt to execute any of the queries listed below, excluding `USE KEYS` queries, they would fail with an error similar to the following:

```json
[
  {
    "code": 4000,
    "msg": "No primary index on keyspace `social`. Use CREATE PRIMARY INDEX to create one.",
    "query_from_user": "SELECT f\rFROM `social` AS users WHERE users.username = 'Eudora43'\r;"
  }
]
```

This is because we have not created any primary or secondary indexes on our bucket.  For the example queries we will first need to create a `PRIMARY INDEX` on our bucket.  

***Note** A primary index is not required and often times is omitted in a production environment.  The primary index allows for adhoc queries and performs a Primary Index scan for those queries.  For large datasets this can result in extremely long running queries, whereas without a primary index an adhoc query will fail immediately if there is not an available index to use for the query.

To start performing the example N1QL queries, execute the following N1QL to create a `PRIMARY INDEX`:

```sql
CREATE PRIMARY INDEX idx_users_primary ON `social`;
```
## Queries

[N1QL Language Reference](http://developer.couchbase.com/documentation/server/current/n1ql/n1ql-language-reference/index.html)

1. [Addresses](addresses.md)
2. [Auth](auth.md)
3. [Chats](chats.md)
4. [Emails](emails.md)
5. [Friends](friends.md)
6. [Phones](phones.md)
7. [Posts](posts.md)
8. [Users](users.md)
