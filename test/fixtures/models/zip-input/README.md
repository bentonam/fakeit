## zip-input Example

This data model demonstrate the following:

- Providing the minimum model definitions to generate data
- Using the `document_index` variable
- Providing input through a Zip file

There is 1 type of model that will be generated

- [Users](#users)

This model requires 5 different input files to be provided at runtime.  Instead of keeping each file separate they are all in a zip file located in `input/config.zip`, this archive contains the following files:

- address.cson
- countries.csv
- email.json
- phone.yaml
- regions.csv

Each entry from the zip archive is extracted, parsed and assigned to the `inputs` variable, which will contain the following keys after the zip archive has been processed:

```
inputs.address;
inputs.countries;
inputs.email;
inputs.phone;
inputs.regions;
```

##### users

```json
{
  "_id": "user_1",
  "doc_type": "user",
  "user_id": 1,
  "first_name": "Leanna",
  "last_name": "Lebsack",
  "username": "Merl43",
  "password": "bk4cH3XGOtwj2T4",
  "emails": [
    {
      "type": "Home",
      "email_address": "Rashawn21@yahoo.com"
    },
    {
      "type": "Home",
      "email_address": "Sydni.Gutkowski10@yahoo.com"
    },
    {
      "type": "Other",
      "email_address": "Marcelo_Sporer@yahoo.com"
    }
  ],
  "phones": [
    {
      "type": "Pager",
      "phone_number": "(976) 270-3821",
      "extension": null
    },
    {
      "type": "Home",
      "phone_number": "(649) 676-5082",
      "extension": null
    },
    {
      "type": "Pager",
      "phone_number": "(356) 791-3557",
      "extension": null
    }
  ],
  "addresses": [
    {
      "type": "Work",
      "address_1": "14507 Antonette Roads Skyway",
      "address_2": null,
      "locality": "East Kaylin",
      "region": "SL-E",
      "postal_code": "76373",
      "country": "SL"
    },
    {
      "type": "Other",
      "address_1": "3173 Wanda Views Curve",
      "address_2": null,
      "locality": "North Carrie",
      "region": "SL-W",
      "postal_code": "09896",
      "country": "SL"
    }
  ],
  "created_on": 1436477160000
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `zip-input/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/
Generating 158 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 user_1.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/ -o yaml
Generating 183 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 user_1.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/ -o cson
Generating 159 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 user_1.cson
```

---

Generate a single JSON document and output it to the console

```bash
[zip-input]$ fakeit -m models/ -i input/ -d console -n 1
Generating 1 documents for Users model
{
  "_id": "user_1",
  "doc_type": "user",
  "user_id": 1,
  "first_name": "Hope",
  "last_name": "Stiedemann",
  "username": "Shanie.Moen",
  "password": "bHzO6fxKmMC_MMF",
  "emails": [
    {
      "type": "Other",
      "email_address": "Nicklaus.Klocko@hotmail.com"
    },
    {
      "type": "Other",
      "email_address": "Jarret_Emmerich@yahoo.com"
    }
  ],
  "phones": [
    {
      "type": "Pager",
      "phone_number": "(850) 966-7192",
      "extension": null
    },
    {
      "type": "Home",
      "phone_number": "(808) 545-5379",
      "extension": null
    },
    {
      "type": "Main",
      "phone_number": "(546) 681-2696",
      "extension": null
    }
  ],
  "addresses": [
    {
      "type": "Work",
      "address_1": "6506 Jalon Pines Camp",
      "address_2": null,
      "locality": "West Emmet",
      "region": "KS-U-A",
      "postal_code": "11184",
      "country": "XK"
    }
  ],
  "created_on": 1435366160000
}
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/ -a export.zip
Generating 156 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the zip-input model and save it to the output directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/ -o csv
Generating 185 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 Users.csv
```

---

Generate a CSV file for the zip-input model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[zip-input]$ fakeit -m models/ -d output/ -i input/ -o csv -a export.zip
Generating 192 documents for Users model
[zip-input]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[zip-input]$ fakeit -m models/ -i input/ -d couchbase
Generating 167 documents for Users model
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `users` with the password of `secret`

```bash
[zip-input]$ fakeit -m models/ -i input/ -d couchbase -s 192.168.1.101 -b users -p secret
Generating 189 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `users` bucket with guest access enabled.

```bash
[zip-input]$ fakeit -m models/ -i input/ -d sync-gateway -s http://localhost:4984 -b users
Generating 192 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `users` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[zip-input]$ fakeit -m models/ -i input/ -d sync-gateway -s http://localhost:4984 -b users -g http://localhost:4985 -u jdoe -p supersecret
Generating 150 documents for Users model
```