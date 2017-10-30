# Friend Queries

These are example N1QL queries that may can performed to retrieve user auth related data.

---

## User Friends

The following query will get a Users Friends by their `user_id`

##### Query

[user\_friends.n1ql](queries/friends/user_friends.n1ql)

```sql
SELECT users.user_id,
    users.first_name || IFNULL(' ' || users.last_name, '') AS friend
FROM social AS user_friends
USE KEYS 'user_100_friends'
INNER JOIN social AS users ON KEYS
    ARRAY 'user_' || TOSTRING( friend.user_id )
        FOR friend IN user_friends.friends
    END
ORDER BY users.first_name ASC,
    users.last_name ASC
```

##### Result

```json
[
  {
    "friend": "Alfred Erdman",
    "user_id": 470
  },
  {
    "friend": "Blanca Brekke",
    "user_id": 685
  },
  {
    "friend": "Camryn Hodkiewicz",
    "user_id": 487
  },
  {
    "friend": "Daphnee Beahan",
    "user_id": 784
  },
  {
    "friend": "Diamond Konopelski",
    "user_id": 204
  },
  {
    "friend": "Drew Kemmer",
    "user_id": 179
  },
  {
    "friend": "Franz Collins",
    "user_id": 302
  },
  {
    "friend": "Griffin Gulgowski",
    "user_id": 90
  },
  {
    "friend": "Hunter Jast",
    "user_id": 387
  },
  {
    "friend": "Jedediah Armstrong",
    "user_id": 822
  },
  {
    "friend": "Johnny Barton",
    "user_id": 380
  },
  {
    "friend": "Kennith Sipes",
    "user_id": 84
  },
  {
    "friend": "Lia Jakubowski",
    "user_id": 252
  },
  {
    "friend": "Melyna Bernhard",
    "user_id": 350
  },
  {
    "friend": "Monica Schneider",
    "user_id": 608
  },
  {
    "friend": "Myrtie Christiansen",
    "user_id": 268
  },
  {
    "friend": "Nayeli Walter",
    "user_id": 798
  },
  {
    "friend": "Nicolas Koepp",
    "user_id": 898
  },
  {
    "friend": "Niko Aufderhar",
    "user_id": 295
  },
  {
    "friend": "Pasquale Pagac",
    "user_id": 160
  },
  {
    "friend": "Peggie Powlowski",
    "user_id": 964
  },
  {
    "friend": "Rebeka Spencer",
    "user_id": 567
  }
]
```

## User Friends

The following query will find users that a given user is not already friends with, where the user has been friends with that person for at least 1 year, and there is more than 5 of the given users friends who are friends with that person.

##### Query

[user\_friends\_of\_friends.n1ql](queries/friends/user_friends_of_friends.n1ql)

```sql
SELECT users.user_id, users.first_name, users.last_name, COUNT(1) AS friends_with
FROM social AS user_friends
USE KEYS 'user_100_friends'
INNER JOIN social AS friends_of_friends ON KEYS (
    ARRAY 'user_' || TOSTRING( friend.user_id ) || '_friends'
        FOR friend IN user_friends.friends
        WHEN DATE_DIFF_MILLIS(CLOCK_MILLIS(), friend.date_friended, 'year') >= 1
    END
)
INNER JOIN social AS users ON KEYS (
    ARRAY 'user_' || TOSTRING( friend.user_id )
        FOR friend IN friends_of_friends.friends
    END
)
WHERE users.user_id NOT IN ARRAY_PREPEND(100,
    (ARRAY friend.user_id
        FOR friend IN user_friends.friends
    END)
)
GROUP BY users.user_id, users.first_name, users.last_name
HAVING COUNT(1) >= 5
ORDER BY COUNT(1) DESC
```

##### Result

```json
[
  {
    "first_name": "Evie",
    "friends_with": 8,
    "last_name": "Franecki",
    "user_id": 22
  },
  {
    "first_name": "Jamil",
    "friends_with": 7,
    "last_name": "Williamson",
    "user_id": 909
  },
  {
    "first_name": "Mallory",
    "friends_with": 7,
    "last_name": "Maggio",
    "user_id": 885
  },
  {
    "first_name": "Jeff",
    "friends_with": 7,
    "last_name": "Carter",
    "user_id": 491
  },
  {
    "first_name": "Edyth",
    "friends_with": 7,
    "last_name": "Morissette",
    "user_id": 693
  },
  {
    "first_name": "Gilberto",
    "friends_with": 7,
    "last_name": "Zieme",
    "user_id": 146
  },
  {
    "first_name": "Felicita",
    "friends_with": 7,
    "last_name": "Kunde",
    "user_id": 107
  },
  {
    "first_name": "Elda",
    "friends_with": 6,
    "last_name": "Flatley",
    "user_id": 795
  },
  {
    "first_name": "Rosemarie",
    "friends_with": 6,
    "last_name": "Rodriguez",
    "user_id": 84
  },
  {
    "first_name": "Valentine",
    "friends_with": 6,
    "last_name": "Dicki",
    "user_id": 840
  },
  {
    "first_name": "Columbus",
    "friends_with": 6,
    "last_name": "Rice",
    "user_id": 294
  },
  {
    "first_name": "Sheila",
    "friends_with": 6,
    "last_name": "Lehner",
    "user_id": 223
  },
  {
    "first_name": "Roel",
    "friends_with": 6,
    "last_name": "Zulauf",
    "user_id": 119
  },
  {
    "first_name": "Mayra",
    "friends_with": 6,
    "last_name": "Waters",
    "user_id": 830
  },
  {
    "first_name": "Malika",
    "friends_with": 6,
    "last_name": "Glover",
    "user_id": 931
  },
  {
    "first_name": "Ines",
    "friends_with": 6,
    "last_name": "Watsica",
    "user_id": 215
  },
  {
    "first_name": "Janet",
    "friends_with": 6,
    "last_name": "Bartell",
    "user_id": 205
  },
  {
    "first_name": "Santa",
    "friends_with": 6,
    "last_name": "Gerhold",
    "user_id": 410
  },
  {
    "first_name": "Deion",
    "friends_with": 6,
    "last_name": "Purdy",
    "user_id": 765
  },
  {
    "first_name": "Abner",
    "friends_with": 6,
    "last_name": "Considine",
    "user_id": 709
  },
  {
    "first_name": "Jackie",
    "friends_with": 6,
    "last_name": "Gutmann",
    "user_id": 495
  },
  {
    "first_name": "Francisca",
    "friends_with": 6,
    "last_name": "Rosenbaum",
    "user_id": 125
  }
]
```
