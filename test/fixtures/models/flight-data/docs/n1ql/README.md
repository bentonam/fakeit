It is assumed that you have imported this entire dataset into a Couchbase bucket named `flight-data`.  The following [N1QL](http://www.couchbase.com/n1ql) queries have been provided as an example of how to query the flight-data dataset.  These indexes and queries are provided for example purposes only.  Pull Requests are welcome, if you see any issues or would like to add your own examples.


## Overview

Be sure to familiarize yourself with each of the available [models](/flight-data/docs/models/) in the Flight Data dataset.

If we were to attempt to execute any of the queries listed below, excluding `USE KEYS` queries, they would fail with an error similar to the following:

```json
[
  {
    "code": 4000,
    "msg": "No primary index on keyspace `flight-data`. Use CREATE PRIMARY INDEX to create one.",
    "query_from_user": "SELECT f\rFROM `flight-data` AS f WHERE f.country_code = 'FI'\r;"
  }
]
```

This is because we have not created any primary or secondary indexes on our bucket.  For the example queries we will first need to create a `PRIMARY INDEX` on our bucket.  

***Note** A primary index is not required and often times is omitted in a production environment.  The primary index allows for adhoc queries and performs a Primary Index scan for those queries.  For large datasets this can result in extremely long running queries, whereas without a primary index an adhoc query will fail immediately if there is not an available index to use for the query.

To start performing the example N1QL queries, execute the following N1QL to create a `PRIMARY INDEX`:

```sql
CREATE PRIMARY INDEX idx_flight_data_primary ON `flight-data`;
```
## Queries

[N1QL Language Reference](http://developer.couchbase.com/documentation/server/current/n1ql/n1ql-language-reference/index.html)

It is recommended to start with the [Countries](countries.md) queries first as there is detailed explanations of each query.

1. [Countries](countries.md)
2. [Regions](regions.md)
3. [Airlines](airlines.md)
4. [Airports](airports.md)
5. [Airport Airlines](airport_airlines.md)
6. [Airport Frequencies](airport_frequencies.md)
7. [Airport Navaids](airport_navaids.md)
8. [Airport Runways](airport_runways.md)
9. [Navaids](navaids.md)
10. [Routes](routes.md)
11. [Users](users.md)
12. [Airlines Reviews](airline_reviews.md)
13. [Airport Reviews](airport_reviews.md)

