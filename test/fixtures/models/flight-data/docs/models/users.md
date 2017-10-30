
# Users Model

### Example Document

```json
{
  "_id": "user_197",
  "doc_type": "user",
  "user_id": 197,
  "account": {
    "username": "Eudora43",
    "password": "N8HERvS8btfGbmz",
    "created_on": 1442822452440,
    "modified_on": 1463594223905,
    "last_login": 1463527441638
  },
  "details": {
    "prefix": "Dr.",
    "first_name": "Albin",
    "middle_name": null,
    "last_name": "Price",
    "suffix": null,
    "company": null,
    "job_title": "Forward Markets Director",
    "dob": "2015-09-24",
    "home_country": "GQ"
  },
  "phones": [
    {
      "type": "Home",
      "phone_number": "(570) 615-4605",
      "extension": null,
      "primary": false
    },
    {
      "type": "Mobile",
      "phone_number": "(923) 578-2435",
      "extension": "1735",
      "primary": true
    }
  ],
  "emails": [
    {
      "type": "Other",
      "email_address": "Malvina15@gmail.com",
      "primary": true
    }
  ],
  "addresses": [
    {
      "type": "Home",
      "address_1": "98527 Tromp Light Lodge",
      "address_2": null,
      "locality": "South Selmerhaven",
      "iso_region": "GQ-CS",
      "postal_code": "49540-9412",
      "iso_country": "GQ",
      "primary": true
    },
    {
      "type": "Home",
      "address_1": "5783 Mathilde Vista Parkway",
      "address_2": "Apt. 899",
      "locality": "Schinnerside",
      "iso_region": "GQ-CS",
      "postal_code": "78895",
      "iso_country": "GQ",
      "primary": false
    }
  ]
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  doc_type:
    type: string
    description: The document type "user"
  user_id:
    type: integer
    description: The users id
  account:
    type: object
    properties:
      username:
        type: string
        description: The users username
          fake: "{{internet.userName}}"
      password:
        type: string
        description: The users password
          fake: "{{internet.password}}"
      created_on:
        type: integer
        description: An epoch time of when the user was created
      modified_on:
        type: integer
        description: An epoch time of when the user was last modified
      last_login:
        type: integer
        description: An epoch time of when the contact was last modified
  details:
    type: object
    description: An object of the user details
    properties:
      prefix:
        type: string
        description: The users prefix
      first_name:
        type: string
        description: The users first name
          fake: "{{name.firstName}}"
      middle_name:
        type: string
        description: The users middle name
      last_name:
        type: string
        description: The users last name
      suffix:
        type: string
        description: The users suffix
      company:
        type: string
        description: The users company
      job_title:
        type: string
        description: The users job title
      dob:
        type: string
        description: The users date of birth
      home_country:
        type: string
        description: The users ISO home country
  phones:
    type: array
    description: An array of phone numbers for the user
    items:
      type: object
      properties:
        type:
          type: string
          description: The phone type
        phone_number:
          type: string
          description: The phone number
        extension:
          type: string
          description: The phone extension
        primary:
          type: boolean
          description: If the phone is the primary phone or not false
  emails:
    type: array
    description: An array of emails for the user
    items:
      type: object
      properties:
        type:
          type: string
          description: The phone type
        email_address:
          type: string
          description: The email address
        primary:
          type: boolean
          description: If the email address is the primary email address or not false
  addresses:
    type: array
    description: An array of addresses
    items:
      type: object
      properties:
        type:
          type: string
          description: The address type
        address_1:
          type: string
          description: The address 1
        address_2:
          type: string
          description: The address_2
        locality:
          type: string
          description: The locality
        iso_region:
          type: string
          description: The ISO region / state / province code
        postal_code:
          type: string
          description: The zip code / postal code
        iso_country:
          type: string
          description: The ISO country code
        primary:
          type: boolean
          description: If the email address is the primary email address or not false


```
