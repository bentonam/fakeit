## simple Example

This data model demonstrate the following:

- Providing the minimum model definitions to generate data
- Using the `document_index` variable

There is 1 type of model that will be generated

- [Users](#users)

##### users

```json
{
  "id": "user_0",
  "type": "user",
  "user_id": 0,
  "first_name": "Alia",
  "last_name": "Lesch",
  "email_address": "Trevion39@yahoo.com",
  "phone": "(831) 627-7628",
  "active": true,
  "created_on": "2016-04-05T19:46:56.000Z"
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `simple/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[simple]$ fakeit -m models/ -d output/
Generating 58 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[simple]$ fakeit -m models/ -d output/ -o yaml
Generating 83 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[simple]$ fakeit -m models/ -d output/ -o cson
Generating 59 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.cson
```

---

Generate a single JSON document and output it to the console

```bash
[simple]$ fakeit -m models/ -d console -n 1
Generating 1 documents for Users model
{
  "id": "user_0",
  "type": "user",
  "user_id": 0,
  "first_name": "Robb",
  "last_name": "McGlynn",
  "email_address": "Gage90@hotmail.com",
  "phone": "(223) 615-9090",
  "active": false,
  "created_on": "2016-03-30T00:34:01.000Z"
}
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[simple]$ fakeit -m models/ -d output/ -a export.zip
Generating 56 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the simple model and save it to the output directory

```bash
[simple]$ fakeit -m models/ -d output/ -o csv
Generating 85 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 Users.csv
```

---

Generate a CSV file for the simple model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[simple]$ fakeit -m models/ -d output/ -o csv -a export.zip
Generating 92 documents for Users model
[simple]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[simple]$ fakeit -m models/ -d couchbase
Generating 67 documents for Users model
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `simple` with the password of `secret`

```bash
[simple]$ fakeit -m models/ -d couchbase -s 192.168.1.101 -b simple -p secret
Generating 89 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `simple` bucket with guest access enabled.

```bash
[simple]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b simple
Generating 92 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `simple` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[simple]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b simple -g http://localhost:4985 -u jdoe -p supersecret
Generating 50 documents for Users model
```