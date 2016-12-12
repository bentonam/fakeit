## Ecommerce Example

These data models demonstrate the following:

- How to use [Model Dependencies](https://github.com/bentonam/fakeit#model-dependencies) with [fakeit](https://github.com/bentonam/fakeit)
- Using the `globals` variable as a counter
- Using the `documents` variable to use data from a previously generated model

There are 4 types of models that will be generated

- [Users](#users)
- [Products](#products)
- [Reviews](#reviews) (has dependencies on Users and Products)
- [Orders](#orders) (has dependencies on Users and Products)

##### users

```json
{
  "_id": "user_48",
  "doc_type": "user",
  "user_id": 48,
  "first_name": "Daphney",
  "last_name": "Labadie",
  "username": "Zaria.Maggio",
  "password": "nivjTg_mxdAB368",
  "email_address": "Holly.Will36@yahoo.com",
  "home_phone": "(833) 083-1364 ",
  "mobile_phone": "(566) 411-9795 ",
  "addresses": [
    {
      "type": "Work",
      "address_1": "6329 Herzog Harbor Well",
      "address_2": "Apt. 197",
      "locality": "South Reuben",
      "region": "LA",
      "postal_code": "23651",
      "country": "US"
    },
    {
      "type": "Work",
      "address_1": "2510 Laverne Way Parks",
      "address_2": "Suite 440",
      "locality": "Schultzberg",
      "region": "WV",
      "postal_code": "23248-7085",
      "country": "US"
    }
  ],
  "created_on": 1453783710000
}
```

##### products

```json
{
  "_id": "product_00019d9a-4e43-4f4a-a7b4-c222d3029f6f",
  "doc_type": "product",
  "product_id": "00019d9a-4e43-4f4a-a7b4-c222d3029f6f",
  "price": 369.91,
  "sale_price": 301.57,
  "display_name": "Handcrafted Plastic Computer",
  "short_description": "Dolores magnam error voluptatem. Quaerat et minima rem velit nihil ab a. Voluptatem occaecati amet pariatur consequuntur corrupti at corporis magni. Consequatur officiis voluptas. Aliquam sunt rerum consequatur quo accusamus et earum occaecati. Consequatur consequatur dolore minus soluta voluptatem quaerat.",
  "long_description": "Quos commodi architecto perspiciatis ullam labore. Ut minus voluptatem est accusamus qui reprehenderit. Sapiente quas quia nesciunt assumenda. Quia nihil nobis laboriosam alias eveniet temporibus alias molestiae maiores.\n \rNeque placeat voluptatem. Quasi facilis neque enim alias fuga quis laborum cupiditate cumque. Eaque aliquid nobis. Facilis numquam in. Nostrum dolorem quia.\n \rEst rerum nihil quos nam. Similique odit et et explicabo molestias dolor fugiat et. Praesentium atque iure nisi quis beatae cupiditate ut voluptatem. Veritatis maxime ad voluptatum. Error ratione quidem. Aut quo exercitationem dolore omnis.\n \rNon minima nobis et reiciendis. Laboriosam odit dolorem aut voluptatem sit sit. Officia veritatis sequi alias veritatis consequatur consectetur velit. Tempora est nisi quaerat saepe dolore odio adipisci repellendus nobis. Corrupti dignissimos aut sapiente.\n \rError culpa non recusandae eos earum iusto ipsum deleniti. Sint molestias ullam excepturi totam ut. Voluptatem pariatur alias dicta libero in itaque nostrum asperiores. Illo harum odit suscipit optio tempore veritatis culpa qui.",
  "keywords": [
    "Bacon",
    "TCP",
    "Practical",
    "neural",
    "payment",
    "optimize",
    "Configuration",
    "Toys"
  ],
  "availability": "Discontinued",
  "availability_date": 1463107773000,
  "product_slug": "handcrafted-plastic-computer",
  "category": "Books",
  "category_slug": "books",
  "image": "http://lorempixel.com/640/480/technics",
  "alternate_images": [
    "http://lorempixel.com/640/480/fashion",
    "http://lorempixel.com/640/480/nightlife",
    "http://lorempixel.com/640/480/people",
    "http://lorempixel.com/640/480/business"
  ],
  "created_on": 1446620814000,
  "modified_on": 1463091354000
}
```
##### reviews

```json
{
  "_id": "review_1a9ecbd1-7177-4620-985e-58bb868e38a9",
  "doc_type": "review",
  "review_id": "1a9ecbd1-7177-4620-985e-58bb868e38a9",
  "product_id": "1f40d2f0-bd3d-4481-b228-4dc4a5f6e464",
  "user_id": 196,
  "reviewer_name": "Lempi Cronin",
  "reviewer_email": "Marisa_Hartmann@gmail.com",
  "rating": 3,
  "review_title": "Qui amet ipsam commodi similique totam.",
  "review_body": "Inventore aspernatur non sit quas ipsum perspiciatis at dignissimos. A doloremque vel. Quas est possimus eveniet qui tempora illo.\n \rQuia qui ullam vel voluptatem recusandae blanditiis. Distinctio non nulla maiores fugiat expedita nihil impedit. Est blanditiis est ex repellat sequi quia facilis. Magni veritatis rem dolores tempora rem earum sint eius.\n \rPerferendis nobis ratione perferendis quia nulla voluptas error cumque. Provident molestiae doloremque beatae quisquam. Earum similique nemo rerum sint quo rem ducimus maxime. Autem voluptatum maiores qui aut et reprehenderit est.",
  "review_date": 1448397151000
}
```

##### orders

```json
{
  "_id": "order_240",
  "doc_type": "order",
  "order_id": 240,
  "user_id": 211,
  "order_date": 1453012781000,
  "order_status": "Shipped",
  "billing_name": "Rosalee Tremblay",
  "billing_phone": "1-238-583-5840 ",
  "billing_email": "Tyree30@gmail.com",
  "billing_address_1": "35196 Harris Station Square",
  "billing_address_2": "",
  "billing_locality": "North Virgietown",
  "billing_region": "RI",
  "billing_postal_code": "47158-8164",
  "billing_country": "US",
  "shipping_name": "Serena Pacocha",
  "shipping_address_1": "01554 Medhurst Port Pike",
  "shipping_address_2": "",
  "shipping_locality": "Lake Bereniceside",
  "shipping_region": "MO",
  "shipping_postal_code": "70416",
  "shipping_country": "US",
  "shipping_method": "USPS",
  "shipping_total": 12.3,
  "tax": 13.95,
  "line_items": [
    {
      "product_id": "0b6d4c3a-e8f2-4b2c-be92-47e11167f6b9",
      "display_name": "Practical Soft Bacon",
      "short_description": "Asperiores voluptas sunt. Aspernatur commodi sed voluptate consequatur placeat nihil harum. At expedita qui veniam aut aperiam neque dignissimos quae beatae. Cum assumenda tenetur recusandae. Quidem facilis placeat in ut et eius voluptatem. Ut vel laboriosam expedita voluptatem voluptates.",
      "image": "http://lorempixel.com/640/480/food",
      "price": 34.32,
      "qty": 4,
      "sub_total": 137.28
    },
    {
      "product_id": "82d2b030-6c5a-41f6-b593-1ab396d7a17a",
      "display_name": "Licensed Granite Chair",
      "short_description": "Sit non dolorem vitae quis qui. Omnis architecto et libero. Facere et quam dolorum qui a aut. Maiores cupiditate a dolorem eum enim. Quia nam architecto sint dicta. Magnam ab esse dolores ut ut soluta hic enim expedita.",
      "image": "http://lorempixel.com/640/480/technics",
      "price": 108.72,
      "qty": 2,
      "sub_total": 217.44
    },
    {
      "product_id": "8f31ab9e-8653-46b6-9bf1-aa66f4c7367a",
      "display_name": "Licensed Soft Sausages",
      "short_description": "Voluptas rerum voluptas. Cum ad nobis. Quia fugiat fugiat impedit rerum repudiandae explicabo. Veniam perspiciatis ut velit aut aut numquam animi molestias. Nihil quos quis quasi dolor qui eius aut placeat eos.",
      "image": "http://lorempixel.com/640/480/abstract",
      "price": 30.57,
      "qty": 5,
      "sub_total": 152.85
    },
    {
      "product_id": "4f953cf6-ad9d-49fd-9998-2daf079f9f6d",
      "display_name": "Licensed Rubber Tuna",
      "short_description": "Sit ducimus in accusantium dolor alias cumque sunt. Repudiandae ea est eveniet dolorem. Numquam et et earum. Adipisci error eos consequuntur. Beatae sapiente odio ipsa. Consequatur odit consequatur et nemo voluptatem enim dolores nemo ducimus.",
      "image": "http://lorempixel.com/640/480/transport",
      "price": 58.02,
      "qty": 4,
      "sub_total": 232.08
    }
  ],
  "grand_total": 765.90
}
```

### Usage Examples

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `ecommerce/` directory:

Generate JSON files and output them to a `output/` directory

```bash
[ecommerce]$ fakeit -m models/ -d output/
Generating 258 documents for Products model
Generating 393 documents for Users model
Generating 354 documents for Orders model
Generating 956 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 user_1.json
	 product_239c719f-950e-5411-afd8-dd964c3446bf.json
	 order_397.json
	 review_56284d21-a10f-59bd-8a11-0016329098bd.json
```

---

Generate YAML files and output them to a `output/` directory

```bash
[ecommerce]$ fakeit -m models/ -d output/ -o yaml
Generating 433 documents for Products model
Generating 483 documents for Users model
Generating 426 documents for Orders model
Generating 806 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 user_1.yaml
	 product_764482e2-218c-4ac2-8761-57fe1ab3b528.yaml
	 order_397.yaml
	 review_6bf50f4a-95bc-444b-a80b-ad63c651800c.yaml
```

---

Generate CSON files and output them to a `output/` directory

```bash
[ecommerce]$ fakeit -m models/ -d output/ -o cson
Generating 326 documents for Products model
Generating 409 documents for Users model
Generating 477 documents for Orders model
Generating 706 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 user_1.cson
	 product_cebf6298-c99d-4df6-b5db-fd4014336a97.cson
	 order_397.cson
	 review_146643aa-7ccd-447a-bde2-bf12ddfd42c8.cson
```

---

Generate JSON files, save them to a zip archive named `export.zip` and output the zip file to the output directory

```bash
[ecommerce]$ fakeit -m models/ -d output/ -a export.zip
Generating 356 documents for Products model
Generating 417 documents for Users model
Generating 543 documents for Orders model
Generating 732 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate a CSV file for the ecommerce model and save it to the output directory

```bash
[ecommerce]$ fakeit -m models/ -d output/ -o csv
Generating 456 documents for Products model
Generating 245 documents for Users model
Generating 675 documents for Orders model
Generating 831 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 Orders.csv
	 Products.csv
	 Reviews.csv
	 Users.csv
```

---

Generate a CSV file for the ecommerce model and save it to a zip archived named `export.zip` and output the zip file to the output directory

```bash
[ecommerce]$ fakeit -m models/ -d output/ -o csv -a export.zip
Generating 365 documents for Products model
Generating 292 documents for Users model
Generating 545 documents for Orders model
Generating 746 documents for Reviews model
[ecommerce]$ ls output | awk '{print "\011",$NF}'
	 export.zip
```

---

Generate JSON documents and output them to a Couchbase Server using the defaults of a server running at `127.0.0.1` in the bucket `default`

```bash
[ecommerce]$ fakeit -m models/ -d couchbase
Generating 434 documents for Products model
Generating 277 documents for Users model
Generating 732 documents for Orders model
Generating 821 documents for Reviews model
```

---

Generate JSON documents and output them to Couchbase Server running at `192.168.1.101` in the bucket `ecommerce` with the password of `secret`

```bash
[ecommerce]$ fakeit -m models/ -d couchbase -s 192.168.1.101 -b ecommerce -p secret
Generating 317 documents for Products model
Generating 239 documents for Users model
Generating 643 documents for Orders model
Generating 713 documents for Reviews model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost` into a `ecommerce` bucket with guest access enabled.

```bash
[ecommerce]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b ecommerce
Generating 274 documents for Products model
Generating 389 documents for Users model
Generating 605 documents for Orders model
Generating 929 documents for Reviews model
```

---

Generate JSON documents and output them to a Couchbase Sync Gateway running at `localhost:4984` into a `ecommerce` bucket using [Custom (Indirect) Authentication](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/administering-sync-gateway/authenticating-users/index.html).

```bash
[ecommerce]$ fakeit -m models/ -d sync-gateway -s http://localhost:4984 -b ecommerce -g http://localhost:4985 -u jdoe -p supersecret
Generating 322 documents for Products model
Generating 250 documents for Users model
Generating 604 documents for Orders model
Generating 737 documents for Reviews model
```