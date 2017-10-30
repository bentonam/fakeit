# Chats Queries

These are example N1QL queries that may can performed to retrieve chat related data.

---

## User Chats

The following query will get all of the chats that a user is in

##### Index

```sql
CREATE INDEX idx_chats_users ON social(
    DISTINCT ARRAY user_id
        FOR user_id IN users
        WHEN user_id IS NOT NULL
    END,
    doc_type
)
WHERE doc_type = 'chat'
```

##### Query

[user\_chats.n1ql](queries/chats/user_chats.n1ql)

```sql
SELECT chats.chat_id, MILLIS_TO_STR(chats.created_on) AS created_on
FROM social AS chats
WHERE ANY user_id IN chats.users
        SATISFIES user_id = 100
    END
    AND chats.doc_type = 'chat'
ORDER BY chats.created_on DESC
```

##### Result

```json
[
  {
    "chat_id": "98509a2e-4ef5-543a-ae8a-61bf583b2cd0",
    "created_on": "2016-05-29T13:31:29.759Z"
  },
  {
    "chat_id": "ed08c58e-dd58-5e2a-981d-f3a9a27d5dd2",
    "created_on": "2016-05-29T11:53:42.56Z"
  },
  {
    "chat_id": "5294f576-4078-50d5-92fe-b194132ffdef",
    "created_on": "2016-05-29T11:21:47.022Z"
  },
  {
    "chat_id": "c5dc5b65-9f42-5768-ba4a-d63a56047e08",
    "created_on": "2016-05-29T10:07:18.824Z"
  },
  ...
]
```


##### Query

Get all of the user chats with all of the users that are part of the chat.

[user\_chats\_with\_users.n1ql](queries/chats/user_chats_with_users.n1ql)

```sql
SELECT chats.chat_id, MILLIS_TO_STR(chats.created_on) AS created_on,
    ARRAY
        {
          "user_id": `user`.user_id,
          "first_name": `user`.first_name,
          "last_name": `user`.last_name
        }
        FOR `user` IN users
    END AS users
FROM social AS chats
INNER NEST social AS users ON KEYS (
    ARRAY 'user_' || TOSTRING ( user_id )
    FOR user_id IN chats.users
        WHEN user_id <> 100
    END
)
WHERE ANY user_id IN chats.users
        SATISFIES user_id = 100
    END
    AND chats.doc_type = 'chat'
ORDER BY chats.created_on DESC
```

##### Result

```json
[
  {
    "chat_id": "98509a2e-4ef5-543a-ae8a-61bf583b2cd0",
    "created_on": "2016-05-29T13:31:29.759Z",
    "users": [
      {
        "first_name": "Electa",
        "last_name": "Maggio",
        "user_id": 746
      }
    ]
  },
  {
    "chat_id": "ed08c58e-dd58-5e2a-981d-f3a9a27d5dd2",
    "created_on": "2016-05-29T11:53:42.56Z",
    "users": [
      {
        "first_name": "Matteo",
        "last_name": "Borer",
        "user_id": 110
      },
      {
        "first_name": "Saul",
        "last_name": "Stroman",
        "user_id": 718
      },
      {
        "first_name": "Caleb",
        "last_name": "Gislason",
        "user_id": 501
      },
      {
        "first_name": "Lenna",
        "last_name": "Johns",
        "user_id": 8
      },
      {
        "first_name": "Ashlynn",
        "last_name": "Herzog",
        "user_id": 623
      },
      {
        "first_name": "Jermaine",
        "last_name": "Mosciski",
        "user_id": 704
      },
      {
        "first_name": "Charley",
        "last_name": "Berge",
        "user_id": 941
      },
      {
        "first_name": "Rebeka",
        "last_name": "Beer",
        "user_id": 513
      },
      {
        "first_name": "Alessandro",
        "last_name": "Sipes",
        "user_id": 205
      }
    ]
  },
  {
    "chat_id": "5294f576-4078-50d5-92fe-b194132ffdef",
    "created_on": "2016-05-29T11:21:47.022Z",
    "users": [
      {
        "first_name": "Cristian",
        "last_name": "Boyer",
        "user_id": 959
      }
    ]
  },
  ...
]
```

## Chat Messages

##### Query

Get all of the messages in a chat along with the users information.

[chat\_messages.n1ql](queries/chats/chat_messages.n1ql)

```sql
SELECT messages.message_id, messages.message,
    MILLIS_TO_STR(messages.message_date) AS message_date,
    users.user_id, users.first_name, users.last_name
FROM social AS messages
INNER JOIN social AS users ON KEYS 'user_' || TOSTRING( messages.user_id )
WHERE messages.chat_id = '98509a2e-4ef5-543a-ae8a-61bf583b2cd0'
    AND messages.doc_type = 'chat-message'
ORDER BY messages.message_date DESC
```

##### Result

```json
[
  {
    "first_name": "Gerry",
    "last_name": "Hodkiewicz",
    "message": "Nesciunt culpa veritatis recusandae et placeat similique nobis aut sapiente.",
    "message_date": "2016-05-29T12:09:15.66Z",
    "message_id": "2ab069aa-b087-54c2-b555-b34ee419d4fc",
    "user_id": 185
  },
  {
    "first_name": "Amara",
    "last_name": "Donnelly",
    "message": "Sit et sequi dolorem et officia vero placeat fugiat. Ex a distinctio illum dolorem est autem sunt a.",
    "message_date": "2016-05-29T09:34:22.812Z",
    "message_id": "05e3d0a1-37cd-56c4-9fb9-5c4f55bc4739",
    "user_id": 512
  },
  {
    "first_name": "Leanne",
    "last_name": "Cormier",
    "message": "Accusamus voluptas sit repellendus repellendus voluptas nam. Amet et doloribus sequi aut iure quia.",
    "message_date": "2016-05-29T09:12:04.303Z",
    "message_id": "2e0f1b05-5ce8-5fff-9899-b14261284116",
    "user_id": 150
  },
  {
    "first_name": "Chandler",
    "last_name": "Botsford",
    "message": "Nisi est quia. Ipsum sed explicabo aut earum quidem quod aperiam.",
    "message_date": "2016-05-29T05:25:29.632Z",
    "message_id": "197d5635-dcde-5060-925d-ba8795019312",
    "user_id": 347
  },
  {
    "first_name": "Sunny",
    "last_name": "Runte",
    "message": "Neque consequatur maxime non qui.",
    "message_date": "2016-05-29T02:30:40.27Z",
    "message_id": "676c9029-59b8-54ba-80c1-eabb09ce5687",
    "user_id": 449
  },
  {
    "first_name": "Kitty",
    "last_name": "Schmitt",
    "message": "Earum amet sed natus. Provident occaecati commodi quae molestias et.",
    "message_date": "2016-05-28T21:45:16.912Z",
    "message_id": "323ad995-490f-5852-a350-253f62a7aa23",
    "user_id": 197
  },
  {
    "first_name": "Deshaun",
    "last_name": "Bednar",
    "message": "Omnis dolore vitae earum.",
    "message_date": "2016-02-09T19:54:21.478Z",
    "message_id": "d45880e2-fa97-502b-b8fa-e5427a9144e0",
    "user_id": 257
  }
]
```
