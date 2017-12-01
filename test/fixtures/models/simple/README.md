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
[simple]$ fakeit directory output models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[simple]$ fakeit directory --format yaml output models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[simple]$ fakeit directory --format cson output models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 0.cson
```

---

Generate a single JSON document and output it to the console

```bash
[simple]$ fakeit console --count 1 models/*
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
[simple]$ fakeit directory --format json output/export.zip models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the simple model and save it to the output directory

```bash
[simple]$ fakeit directory --format csv output models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 Users.csv
```

---

Generate a CSV file for the simple model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[simple]$ fakeit directory --format csv output/export.zip models/*
[simple]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[simple]$ fakeit couchbase models/*
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `simple` with the password of `secret`

```bash
[simple]$ fakeit couchbase --server 192.168.1.101 --bucket simple --password secret models/*
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `simple` bucket with guest access enabled.

```bash
[simple]$ fakeit sync-gateway --server http://localhost:4984 --bucket simple models/*
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `simple` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[simple]$ fakeit sync-gateway --server http://localhost:4984 --bucket simple  --username jdoe --password supersecret models/*
```