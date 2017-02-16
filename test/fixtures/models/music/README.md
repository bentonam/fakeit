## Music Example

These data models demonstrate the following:

- Providing input to the model
- Setting the number of documents to generate dynamically
- Using the `globals` variable as a counter
- Using the `inputs` to make external data available to the model
- Using the `documents` variable to use data from a previously generated model

There are 4 types of models that will be generated

- [Countries](#countries)
- [Playlists](#playlists) (has dependencies on Users and Tracks)
- [Tracks](#tracks) (has dependency on Users)
- [Users](#users)

##### countries

```json
{
  "_id": "country_US",
  "gdp": 8082,
  "countryCode": "US",
  "region-number": "249",
  "name": "United States",
  "updated": "2016-02-15T03:08:48.000Z",
  "population": 41159
}
```

##### playlists

```json
{
  "_id": "playlist_2a6089a7-1f5d-47ad-a2e1-ca5bad6a922b",
  "type": "playlist",
  "id": "2a6089a7-1f5d-47ad-a2e1-ca5bad6a922b",
  "created": "2016-03-15T23:14:27.000Z",
  "updated": "2016-05-13T10:52:20.000Z",
  "visibility": "PUBLIC",
  "owner": {
    "firstName": "Wade",
    "lastName": "Breitenberg",
    "created": 1461666829000,
    "updated": "2016-04-26T10:33:49.000Z",
    "picture": {
      "large": "http://lorempixel.com/800/800/cats?91462",
      "thumbnail": "http://lorempixel.com/100/100/abstract?66094",
      "medium": "http://lorempixel.com/400/400/business"
    },
    "username": "Marina.Sawayn"
  },
  "tracks": [
    "DFF520E3827C99085D24906C8C86FB20293BA672",
    "0AFB7404CB5411D0242B27B210E6432CA836102B",
    "82B94CDAB224618155C85A8A6E9F9519BB45BC70",
    "3EEE4265C38C487A7DFF64A45179E20C39861465",
    "6058220C5CF3C38535AA7388DEE18BF907158C0E"
  ]
}
```
##### tracks

```json
{
  "_id": "track_0F9C4FD902FF3167C0F06599888BEDE9AA0FAC4B",
  "type": "track",
  "id": "0F9C4FD902FF3167C0F06599888BEDE9AA0FAC4B",
  "created": "2015-09-02T17:44:42.000Z",
  "updated": "2016-05-13T05:08:44.000Z",
  "artist": "Distributed initiatives",
  "title": "Licensed Metal Pizza",
  "mp3": "https://mayra.biz/dillan/files/Licensed%20Metal%20Pizza.mp3",
  "genre": "Electroswing",
  "ratings": [
    {
      "created": "2016-02-03T07:52:20.688Z",
      "rating": 2,
      "username": "Annabelle_Feeney"
    },
    {
      "created": "2015-08-09T17:18:02.190Z",
      "rating": 1,
      "username": "Eliza72"
    },
    {
      "created": "2015-09-07T19:41:30.043Z",
      "rating": 3,
      "username": "Maida.Fisher24"
    },
    {
      "created": "2015-10-20T22:04:03.562Z",
      "rating": 5,
      "username": "Nellie62"
    },
    {
      "created": "2015-12-23T09:49:36.181Z",
      "rating": 5,
      "username": "Shane_Price98"
    }
  ]
}
```

##### users

```json
{
  "_id": "user_Alfonzo_McLaughlin",
  "type": "userprofile",
  "username": "Alfonzo_McLaughlin",
  "title": "Miss",
  "firstName": "Denis",
  "lastName": "Ortiz",
  "gender": "female",
  "email": "Tracey_Lemke52@yahoo.com",
  "pwd": "dr586QT6_r30OlG",
  "address": {
    "state": "Texas",
    "city": "Vicenteburgh",
    "countryCode": "MN",
    "street": "3832 Jane Lodge",
    "postalCode": "06288-1285"
  },
  "phones": [
    {
      "type": "main",
      "verified": "2015-08-14T12:50:37.446Z",
      "number": "118.844.4854 "
    },
    {
      "type": "main",
      "verified": "2016-02-29T21:53:07.345Z",
      "number": "026.291.1586 "
    }
  ],
  "favoriteGenres": [
    "Hardcore Rap",
    "Classical",
    "Ambient",
    "Pop Punk",
    "Rock & Roll"
  ],
  "dateOfBirth": "2015-12-17",
  "status": "active",
  "created": "2015-09-29T10:24:28.000Z",
  "updated": "2015-09-29T10:24:28.000Z",
  "picture": {
    "large": "http://lorempixel.com/800/800/cats?47694",
    "thumbnail": "http://lorempixel.com/100/100/business?3831",
    "medium": "http://lorempixel.com/400/400/city"
  }
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `music/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[music]$ fakeit -m models/ -d output/
Generating 264 documents for Countries model
Generating 498 documents for Users model
Generating 522 documents for Tracks model
Generating 878 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 country_US.json
	 playlist_1f65aaf1-fc8d-4cf0-b20f-33bbb911ae66.json
	 track_00ACAED3FA63BD2B44B9B48BA1DE2B844CA4DADF.json
	 user_Alfonzo_McLaughlin.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[music]$ fakeit -m models/ -d output/ -o yaml
Generating 264 documents for Countries model
Generating 584 documents for Users model
Generating 624 documents for Tracks model
Generating 858 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 country_CA.cson
	 playlist_00e377c6-2673-48ef-b63e-c625a5f367a8.yaml
	 track_2C6A74694FB932CDF8B07AC85FDA0F2D992ABE28.yaml
	 user_Ana2.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[music]$ fakeit -m models/ -d output/ -o cson
Generating 264 documents for Countries model
Generating 429 documents for Users model
Generating 712 documents for Tracks model
Generating 866 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 country_AU.cson
	 playlist_0ccc9d20-6c86-4266-8733-81718f417619.cson
	 track_00ACAED3FA63BD2B44B9B48BA1DE2B844CA4DADF.cson
	 user_Aracely_Howe68.cson
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[music]$ fakeit -m models/ -d output/ -a export.zip
Generating 264 documents for Countries model
Generating 409 documents for Users model
Generating 534 documents for Tracks model
Generating 789 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the music model and save it to the output directory

```bash
[music]$ fakeit -m models/ -d output/ -o csv
Generating 264 documents for Countries model
Generating 416 documents for Users model
Generating 794 documents for Tracks model
Generating 609 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 Countries.csv
	 Playlists.csv
	 Tracks.csv
	 Users.csv
```

---

Generate a CSV file for the music model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[music]$ fakeit -m models/ -d output/ -o csv -a export.zip
Generating 264 documents for Countries model
Generating 510 documents for Users model
Generating 594 documents for Tracks model
Generating 879 documents for Playlists model
[music]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[music]$ fakeit -m models/ -d couchbase
Generating 264 documents for Countries model
Generating 415 documents for Users model
Generating 751 documents for Tracks model
Generating 687 documents for Playlists model®
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `music` with the password of `secret`

```bash
[music]$ fakeit -m models/ -d couchbase -s 192.168.1.101 -b music -p secret
Generating 264 documents for Countries model
Generating 598 documents for Users model
Generating 632 documents for Tracks model
Generating 747 documents for Playlists model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `music` bucket with guest access enabled.

```bash
[music]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b music
Generating 264 documents for Countries model
Generating 494 documents for Users model
Generating 557 documents for Tracks model
Generating 847 documents for Playlists model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `music` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[music]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b music -g http://localhost:4985 -u jdoe -p supersecret
Generating 264 documents for Countries model
Generating 509 documents for Users model
Generating 723 documents for Tracks model
Generating 834 documents for Playlists model
```