## Contacts Example

These data models demonstrate the following:

-  [Model References](https://github.com/bentonam/fakeit#model-references) with [fakeit](https://github.com/bentonam/fakeit)
- Using `build` and `post_build` functions

Below is a sample JSON output that this model would generate:

```json
{
  "_id": "contact_5da4c2ee-9d74-53db-bf9e-5124cee7fa0b",
  "doc_type": "contact",
  "contact_id": "5da4c2ee-9d74-53db-bf9e-5124cee7fa0b",
  "created_on": 1446200011095,
  "modified_on": 1463089434988,
  "details": {
    "prefix": "Mrs.",
    "first_name": "Lemuel",
    "middle_name": "Berniece",
    "last_name": "Ruecker",
    "company": "Cormier - Metz",
    "job_title": "Product Accountability Liason",
    "dob": "1980-10-17",
    "nickname": null
  },
  "phones": [
    {
      "type": "Home",
      "phone_number": "(903) 017-7802 ",
      "extension": null
    },
    {
      "type": "Main",
      "phone_number": "1-547-967-1821",
      "extension": null
    }
  ],
  "emails": [
    "Patricia_VonRueden@hotmail.com"
  ],
  "addresses": [
    {
      "type": "Other",
      "address_1": "824 Rowe Extension Route",
      "address_2": "Suite 638",
      "locality": "Rosaleeshire",
      "region": "AK",
      "postal_code": "49283",
      "country": "US"
    }
  ],
  "notes": "Quas qui id exercitationem.",
  "tags": [
    "Fish",
    "even-keeled"
  ]
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `contacts/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[contacts]$ fakeit -m models/ -d output/
Generating 56 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'                                       
	 contact_2040b03c-db18-5c85-95b0-37544a2804b1.json
	 contact_239c719f-950e-5411-afd8-dd964c3446bf.json
	 contact_3974b731-792b-5cdd-adc0-0fb56f125dfd.json
	 contact_56284d21-a10f-59bd-8a11-0016329098bd.json
	 contact_8c43f9a6-adcf-5baa-ae78-dd02b8c60944.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[contacts]$ fakeit -m models/ -d output/ -o yaml
Generating 77 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'                                       
	 contact_6bf50f4a-95bc-444b-a80b-ad63c651800c.yaml
	 contact_09a1c89b-d61a-4129-81c9-c9fb47b12452.yaml
	 contact_764482e2-218c-4ac2-8761-57fe1ab3b528.yaml
	 contact_86171c44-66e8-4ac7-80d2-8d2a2f1d30f2.yaml
	 contact_a7404ed8-a188-4c1b-a9ab-765104a5efe3.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[contacts]$ fakeit -m models/ -d output/ -o cson
Generating 77 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'                                       
	 contact_146643aa-7ccd-447a-bde2-bf12ddfd42c8.cson
	 contact_cebf6298-c99d-4df6-b5db-fd4014336a97.cson
	 contact_9d642796-1163-48d3-9a15-87dfa9d0c37b.cson
	 contact_dd8e314b-b14d-421d-89d4-436d66d6b159.cson
	 contact_d2d55ded-ec9f-4dc8-925a-80f9a4a9555a.cson
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[contacts]$ fakeit -m models/ -d output/ -a export.zip
Generating 72 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the contacts model and save it to the output directory

```bash
[contacts]$ fakeit -m models/ -d output/ -o csv
Generating 64 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'
	 Contacts.csv
```

---

Generate a CSV file for the contacts model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[contacts]$ fakeit -m models/ -d output/ -o csv -a export.zip
Generating 88 documents for Contacts model
[contacts]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[contacts]$ fakeit -m models/ -d couchbase
Generating 93 documents for Contacts model
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `contacts` with the password of `secret`

```bash
[contacts]$ fakeit -m models/ -d couchbase -s 192.168.1.101 -b contacts -p secret
Generating 87 documents for Contacts model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `contacts` bucket with guest access enabled.

```bash
[contacts]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b contacts
Generating 63 documents for Contacts model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `contacts` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[contacts]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b contacts -g http://localhost:4985 -u jdoe -p supersecret
Generating 97 documents for Contacts model
```