## Flat Example

These data models demonstrate the following:

- Using the `globals` variable as a counter
- Using the `fake` property to generate data

There are 2 types of models that will be generated

- [Users](#users)
- [Products](#products)

##### users

```json
{
  "user_id": 1,
  "first_name": "Alexandra",
  "last_name": "Mann",
  "email_address": "Edison_Johnston@hotmail.com",
  "home_phone": "(444) 992-7683 ",
  "mobile_phone": "(400) 780-2145",
  "address_1": "462 Macejkovic Forks Center",
  "address_2": "Apt. 209",
  "locality": "West Victoria",
  "region": "VA",
  "postal_code": "71931-2381",
  "country": "US"
}
```

##### products

```json
{
  "_id": "product_191d9fe5-01be-4292-8372-e7821ebdab2a",
  "doc_type": "product",
  "product_id": "191d9fe5-01be-4292-8372-e7821ebdab2a",
  "price": 421.41,
  "sale_price": 218.69,
  "display_name": "Practical Cotton Shoes",
  "short_description": "Ullam atque non. Similique voluptatem aut expedita sunt aliquam dignissimos voluptatem dicta rem. Libero sit similique. Quia qui nostrum molestias veniam. Aut iusto quidem. Amet qui velit corporis.",
  "long_description": "In dolorum minus ipsum necessitatibus repellendus optio ut. Ipsam sit pariatur sapiente illum unde iure. Ipsam libero quidem impedit inventore magnam. Et dolorum quis ut architecto.\n \rSoluta dolor autem magnam cum error ut. Aspernatur aut qui quia vel qui dolor autem est. Cum dolor ut ut ea suscipit fugit commodi.\n \rEius nulla similique sed alias minima ex magni quam. Praesentium blanditiis eum nam dolores iusto voluptas qui molestiae rerum. Aut qui architecto beatae vel id ad voluptates. Earum numquam id.\n \rUllam voluptates quia qui aliquam ea. Sequi velit ut exercitationem odit ut fugit hic sint soluta. Odio dolores labore quae voluptate et inventore nihil in. Voluptatem voluptas rem.\n \rEt et minus deserunt quo ut culpa illum. Quia voluptas necessitatibus sapiente iure. Porro commodi sunt sequi cumque minima. Culpa assumenda minima.",
  "keywords": "hacking,Bedfordshire,grow,Stand-alone,Isle of Man",
  "availability": "In-Stock",
  "availability_date": 1463156597000,
  "product_slug": "practical-cotton-shoes",
  "category": "Sports",
  "category_slug": "sports",
  "image": "http://lorempixel.com/640/480/city",
  "created_on": 1433788683000,
  "modified_on": 1463132194000
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `flat/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[flat]$ fakeit -m models/ -d output/
Generating 155 documents for Products model
Generating 241 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 1.json
	 product_239c719f-950e-5411-afd8-dd964c3446bf.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[flat]$ fakeit -m models/ -d output/ -o yaml
Generating 233 documents for Products model
Generating 383 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 1.yaml
	 product_764482e2-218c-4ac2-8761-57fe1ab3b528.yaml
```

---

---Generate CSON files and output them to a `output/` directory

```bash
[flat]$ fakeit -m models/ -d output/ -o cson
Generating 326 documents for Products model
Generating 209 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 1.cson
	 product_cebf6298-c99d-4df6-b5db-fd4014336a97.cson
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[flat]$ fakeit -m models/ -d output/ -a export.zip
Generating 356 documents for Products model
Generating 217 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the flat model and save it to the output directory

```bash
[flat]$ fakeit -m models/ -d output/ -o csv
Generating 456 documents for Products model
Generating 245 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 Products.csv
	 Users.csv
```

---

Generate a CSV file for the flat model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[flat]$ fakeit -m models/ -d output/ -o csv -a export.zip
Generating 365 documents for Products model
Generating 292 documents for Users model
[flat]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[flat]$ fakeit -m models/ -d couchbase
Generating 434 documents for Products model
Generating 277 documents for Users model
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `flat` with the password of `secret`

```bash
[flat]$ fakeit -m models/ -d couchbase -s 192.168.1.101 -b flat -p secret
Generating 317 documents for Products model
Generating 239 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `flat` bucket with guest access enabled.

```bash
[flat]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b flat
Generating 274 documents for Products model
Generating 389 documents for Users model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `flat` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[flat]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b flat -g http://localhost:4985 -u jdoe -p supersecret
Generating 322 documents for Products model
Generating 250 documents for Users model
```