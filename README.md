# Data Generator

Generates a variety of output data based on models which are defined in YAML.  Model dependencies can be defined, where data from a previous models generation can be made available to the model currently being generated.   

Generated data can be output in the following formats and destinations:

- JSON files
- YAML files
- CSV files
- Zip Archive of JSON, YAML or CSV files
- Couchbase Server
- Couchbase Sync Gateway Server

## Install

```bash
npm install data-generator -g
```

## Usage

```bash
data-generator [options]
```

## Options

- `-o, --output [value]` (optional) The output format to generate.  Supported formats are: json, csv, yaml. The default value is **json**
- `-a, --archive [value]` (optional) The archive filename to generate.  Supported formats are: zip.  Example: export.zip
- `-m, --models [value]` (optional) A directory or comma-delimited list of files models to use.  The default is the current working directory
- `-d, --destination [value]` (optional) The output destination.  Values can be: couchbase, console or a directory path.  The default value is the current working directory
- `-f, --format [value]` (optional) The spacing format to use for JSON and YAML file generation.  The default value is 2
- `-n, --number [value]` (optional) Overrides the number of documents to generate specified by the model
- `-i, --input [value]` (optional) A directory of files or a comma-delimited list of files to use as inputs.  Support formats are: json, yaml, csv
- `-s, --server [address]` (optional) A Couchbase Server or Sync-Gateway Address.  The default value is **127.0.0.1**
- `-b, --bucket [name]` (optional) The name of a Couchbase Bucket.  The default value is **default**
- `-p, --password [value]` (optional) A Couchbase Bucket or Sync Gateway user password
- `-g, --sync_gateway_admin [value]` (optional) A Sync Gateway Admin address.  
- `-u, --username [value]` (optional) A Sync Gateway username.  
- `-h, --help` Displays available options

## Models

All data is generated from one or more [YAML](http://yaml.org/) files.  Models are defined very similar to how models are defined in [Swagger](http://swagger.io/).  With the addition of a few more properties that are used for data generation:

At the root of a model the following keys are used:

- `name:` *(required)* The name of the model
- `type:` *(required)* The data type of the model to be generated
- `key:` *(required)* The main key for the document.  This is a reference to a generated property and is used for the filename or Document ID
- `data:` *(optional)* Defines how many documents should be generated for the model, as well as event callbacks. The following properties are used:
  - `min:` *(optional)* The minimum number of documents to generate
  - `max:` *(optional)* The maximum number of documents to generate
  - `fixed:` *(optional)* A fixed number of documents to generate
  - `pre_run:` *(optional)* A function to be ran before the model generation starts
  - `pre_build:` *(optional)* A function to be ran before each document is generated
  - `post_build:` *(optional)* A function to be ran after each document is generated
  - `post_run:` *(optional)* A function to be ran after all documents for a model have been generated
- `properties:` *(required)* The properties for a model.  Each property can have the following:
  - `type:` *(required)* The data type of the property.  Values can be: `string`, `number`, `integer`, `long`, `double`, `float`, `array`, `object`
  - `description:` *(optional)* A description of the property
  - `data:` *(optional)* Defines the how the data should be generated.  The following properties can be used:
    - `value:` A static value to be used
    - `fake:` A template string to be used by Faker i.e. `"{{name.firstName}}"`
    - `pre_build:` A function to be called after the value has been initialized.  The property value is assigned from the result.
    - `build:` A function to be called to build the value. The property value is assigned from the result.
    - `post_build:` A function to be called on the property after all of the documents properties have been generated. The property value is assigned from the result.

#### Model Events / Build Functions

Each model can have it's own `pre_(run|build)` and `post_(run|build)` functions, additionally each property can have its on `pre_build`, `build` and `post_build` functions.  

Each one of these functions is passed the following variables that can be used at the time of its execution:

- `documents` - An object containing a key for each model whose value is an array of each document that has been generated
- `globals` - An object containing any global variables that may have been set by any of the run or build functions
- `inputs` - An object containing a key for each input file used whose value is the deserialized version of the files data
- `faker` - A reference to [FakerJS](http://marak.github.io/faker.js/)
- `chance` - A reference to [ChanceJS](http://chancejs.com/)
- `current_document` - The currently generated document
- `current_value` - The currently generated value

#### Example users.yaml Model

```yaml
name: Users
type: object
key: _id
data:
  min: 200
  max: 500
  pre_run: >
    globals.user_counter = 0;
properties:
  id:
    type: string
    data:
      post_build: "return 'user_' + current_document.user_id;"
  type:
    type: string
    data:
      value: "user"
  user_id:
    type: integer
    data:
      build: "return ++globals.user_counter;"
  first_name:
    type: string
    data:
      fake: "{{name.firstName}}"
  last_name:
    type: string
    description: The users last name
    data:
      fake: "{{name.lastName}}"
  email_address:
    type: string
    data:
      fake: "{{internet.email}}"
  phone:
    type: string
    data:
      build: "return chance.phone();"
  created_on:
    type: string
    data:
      fake: "{{date.past}}"
      post_build: "return new Date(current_value).toISOString();"

```

We can generate data for this model by executing the following command:

```bash
data-generator -m users.yaml -n 5 -d console
```

This will generate 5 documents for the users model and output the results to the console:

```json
{
  "id": "user_1",
  "type": "user",
  "user_id": 1,
  "first_name": "Kacey",
  "last_name": "Tremblay",
  "email_address": "Oliver_Rogahn74@gmail.com",
  "phone": "(981) 265-4296",
  "created_on": "2015-05-25T10:31:03.000Z"
}
{
  "id": "user_2",
  "type": "user",
  "user_id": 2,
  "first_name": "Retta",
  "last_name": "Hagenes",
  "email_address": "Eileen91@hotmail.com",
  "phone": "(458) 869-4723",
  "created_on": "2015-11-24T09:37:40.000Z"
}
{
  "id": "user_3",
  "type": "user",
  "user_id": 3,
  "first_name": "Elwyn",
  "last_name": "Rice",
  "email_address": "Desiree61@gmail.com",
  "phone": "(904) 705-6471",
  "created_on": "2015-06-06T05:44:05.000Z"
}
{
  "id": "user_4",
  "type": "user",
  "user_id": 4,
  "first_name": "Danielle",
  "last_name": "Cruickshank",
  "email_address": "Dorthy14@hotmail.com",
  "phone": "(876) 646-9148",
  "created_on": "2016-01-02T18:46:08.000Z"
}
{
  "id": "user_5",
  "type": "user",
  "user_id": 5,
  "first_name": "Sid",
  "last_name": "Hammes",
  "email_address": "Maybell.Murphy@hotmail.com",
  "phone": "(224) 531-6070",
  "created_on": "2015-07-05T08:21:55.000Z"
}
```

## Examples