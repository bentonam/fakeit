# Posts Queries

These are example N1QL queries that may can performed to retrieve post related data.

---

## User Post

The following query will get all of the posts that a user is in

##### Index

```sql
CREATE INDEX idx_posts_users ON social( user_id, visibility, doc_type )
WHERE doc_type = 'post'
```

##### Query

[user\_posts.n1ql](queries/posts/user_posts.n1ql)

```sql
SELECT posts.post_id, posts.post, posts.visibility,
    MILLIS_TO_STR(posts.post_date) AS post_date
FROM social AS posts
WHERE posts.user_id = 100 AND visibility IS NOT NULL AND posts.doc_type = 'post'
ORDER BY posts.post_date DESC
```

##### Result

```json
[
  {
    "post": "Amet quia doloribus magnam quia dolorem repellendus officia quia. Aut voluptatem explicabo aut explicabo dolorem debitis adipisci. Rerum consequuntur eaque perspiciatis nostrum sed. Qui animi voluptatem qui id.",
    "post_date": "2016-06-08T10:49:34.584Z",
    "post_id": "29dace3f-400a-52d1-be13-c035e6b1a916",
    "visibility": "private"
  },
  {
    "post": "Sint aut excepturi dolor eum fugit accusantium qui neque. Laboriosam quo omnis fugiat. Eligendi earum ipsum. Tempora sunt aut perspiciatis.",
    "post_date": "2016-06-08T10:33:35.929Z",
    "post_id": "c2df5677-5c05-508d-bfb9-dc52d9922be9",
    "visibility": "public"
  },
  {
    "post": "Non dolorum atque laborum omnis autem sunt mollitia eum odio. Et alias assumenda consequuntur. Rerum cupiditate distinctio aut est nulla dolores adipisci.",
    "post_date": "2016-06-08T06:18:28.78Z",
    "post_id": "ff097e6d-4485-5278-a5c5-f56912056e9d",
    "visibility": "public"
  },
  {
    "post": "In quia praesentium alias.",
    "post_date": "2016-06-08T01:22:54.55Z",
    "post_id": "20d426f1-2cc3-5e2b-8f9a-d45ab3e4156e",
    "visibility": "public"
  },
  ...
]
```

---

## User Friends Posts

##### Query

Get the most recent 10 posts from a users friends all of a users friends posts

[user\_friends\_posts.n1ql](queries/posts/user_friends_posts.n1ql)

```sql
SELECT posts.post_id, posts.post, posts.visibility, MILLIS_TO_STR(posts.post_date) AS post_date
FROM social AS posts
WHERE posts.user_id IN (
        ARRAY friend.user_id
            FOR friend IN (
                SELECT friends.user_id
                FROM social AS user_friends
                USE KEYS 'user_100_friends'
                UNNEST user_friends.friends AS friends
            )
        END
    )
    AND
    posts.visibility = 'public' AND
    posts.doc_type = 'post'
ORDER BY posts.post_date DESC
LIMIT 10
```

##### Result

```json
[
  {
    "post": "Voluptas accusamus ab dicta eum repellendus iure nesciunt est fugit. Quod ut corrupti est hic autem sint porro earum fugiat. Facere optio et sit corrupti sit quaerat assumenda doloribus blanditiis.",
    "post_date": "2016-06-08T20:21:24.728Z",
    "post_id": "68641084-778a-537f-a567-75c0312c390f",
    "visibility": "public"
  },
  {
    "post": "Eveniet eaque tempora voluptas adipisci officia ducimus voluptates sit optio.",
    "post_date": "2016-06-08T20:18:55.905Z",
    "post_id": "068f9f23-a2b5-5084-bd98-677b92e5151c",
    "visibility": "public"
  },
  {
    "post": "Ex commodi vitae iusto qui magni.",
    "post_date": "2016-06-08T20:18:32.788Z",
    "post_id": "4519195d-7c22-51bf-b88f-1fab62fac8c9",
    "visibility": "public"
  },
  {
    "post": "Aut saepe sequi sunt ratione eius consectetur qui. Numquam deleniti occaecati. Eveniet aut dignissimos. In et et pariatur nam voluptates error sit eum.",
    "post_date": "2016-06-08T20:17:49.699Z",
    "post_id": "cbd565a2-e61c-5fc2-8203-fc38c9842968",
    "visibility": "public"
  },
  {
    "post": "Recusandae aut sit. Ut et totam repellat ex accusamus adipisci. Libero minus esse quos magnam possimus expedita vel.",
    "post_date": "2016-06-08T20:17:29.831Z",
    "post_id": "d058d678-2095-553a-ac19-79592b87b6d5",
    "visibility": "public"
  },
  {
    "post": "Ipsum esse culpa culpa voluptatem esse.",
    "post_date": "2016-06-08T20:14:11.303Z",
    "post_id": "90ffe16d-11f7-5a2d-8af1-08433c2f3e77",
    "visibility": "public"
  },
  {
    "post": "Eum eos illum porro similique debitis recusandae est aspernatur nemo. Et ut quia ut neque rerum aut quidem.",
    "post_date": "2016-06-08T20:10:44.58Z",
    "post_id": "b70c14d6-3edf-515d-a008-3db233505f3f",
    "visibility": "public"
  },
  {
    "post": "Doloremque dolores soluta. Deserunt sit iste quibusdam et a nesciunt error quod. Cumque voluptatem placeat non et. Soluta itaque laudantium voluptas neque ullam nemo. Pariatur dolores omnis maxime id.",
    "post_date": "2016-06-08T20:09:07.011Z",
    "post_id": "b118a0e0-0f9c-56a0-90f3-fe54b990f478",
    "visibility": "public"
  },
  {
    "post": "Explicabo tempore tenetur suscipit cupiditate qui dolorem ex. In cum labore tenetur officiis cumque debitis eveniet. Nesciunt magni minus.",
    "post_date": "2016-06-08T20:03:25.975Z",
    "post_id": "1ac0e02b-2f1b-5b90-92fa-d2bb82f8bf14",
    "visibility": "public"
  },
  {
    "post": "Alias nam ut modi est. Libero delectus omnis eos et voluptatibus. Iusto odio quae ut nesciunt.",
    "post_date": "2016-06-08T19:58:34.329Z",
    "post_id": "2f2e263a-a3bf-5208-9dfa-f467875d7b02",
    "visibility": "public"
  }
]
```
