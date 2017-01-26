var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Users',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  seed: 0,
  data: {
    min: 0,
    max: 0,
    count: 10000,
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.array().items(is.string()).length(0),
    pre_run: is.func(),
    pre_build: is.func(),
    post_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    user_id: utils.check('integer', 'The users id', { build: is.func(), }),
    account: {
      data: is.object().length(0),
      type: 'object',
      properties: {
        username: utils.check('string', 'The users username', { fake: is.string(), }),
        password: utils.check('string', 'The users password', { fake: is.string(), }),
        created_on: utils.check('integer', 'An epoch time of when the user was created', { build: is.func(), }),
        modified_on: utils.check('integer', 'An epoch time of when the user was last modified', { build: is.func(), }),
        last_login: utils.check('integer', 'An epoch time of when the contact was last modified', { build: is.func(), }),
      },
    },
    details: {
      data: is.object().length(0),
      description: 'An object of the user details',
      type: 'object',
      schema: {
        $ref: '#/definitions/Details',
      },
      properties: {
        prefix: utils.check('string', 'The users prefix', { build: is.func(), }),
        first_name: utils.check('string', 'The users first name', { fake: is.string(), }),
        middle_name: utils.check('string', 'The users middle name', { build: is.func(), }),
        last_name: utils.check('string', 'The users last name', { build: is.func(), }),
        suffix: utils.check('string', 'The users suffix', { build: is.func(), }),
        company: utils.check('string', 'The users company', { build: is.func(), }),
        job_title: utils.check('string', 'The users job title', { build: is.func(), }),
        dob: utils.check('string', 'The users date of birth', { build: is.func(), }),
        home_country: utils.check('string', 'The users ISO home country', { build: is.func(), }),
      },
    },
    phones: {
      type: 'array',
      description: 'An array of phone numbers for the user',
      items: {
        data: {
          min: 1,
          max: 3,
          count: 0,
        },
        $ref: '#/definitions/Phone',
        type: 'object',
        properties: {
          type: utils.check('string', 'The phone type', { build: is.func(), }),
          phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
          extension: utils.check('string', 'The phone extension', { build: is.func(), }),
          primary: utils.check('boolean', 'If the phone is the primary phone or not', { value: is.boolean(), }),
        },
      },
    },
    emails: {
      type: 'array',
      description: 'An array of emails for the user',
      items: {
        data: {
          min: 1,
          max: 3,
          count: 0,
        },
        $ref: '#/definitions/Email',
        type: 'object',
        properties: {
          type: utils.check('string', 'The phone type', { build: is.func(), }),
          email_address: utils.check('string', 'The email address', { build: is.func(), }),
          primary: utils.check('boolean', 'If the email address is the primary email address or not', { value: is.boolean(), }),
        },
      },
    },
    addresses: {
      type: 'array',
      description: 'An array of addresses',
      items: {
        data: {
          min: 1,
          max: 2,
          count: 0,
        },
        $ref: '#/definitions/Address',
        type: 'object',
        properties: {
          type: utils.check('string', 'The address type', { build: is.func(), }),
          address_1: utils.check('string', 'The address 1', { build: is.func(), }),
          address_2: utils.check('string', 'The address_2', { build: is.func(), }),
          locality: utils.check('string', 'The locality', { build: is.func(), }),
          iso_region: utils.check('string', 'The ISO region / state / province code', { build: is.func(), }),
          postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
          iso_country: utils.check('string', 'The ISO country code', { build: is.func(), }),
          primary: utils.check('boolean', 'If the email address is the primary email address or not', { value: is.boolean(), }),
        },
      },
    },
  },
  definitions: {
    Email: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The phone type', { build: is.func(), }),
        email_address: utils.check('string', 'The email address', { build: is.func(), }),
        primary: utils.check('boolean', 'If the email address is the primary email address or not', { value: is.boolean(), }),
      },
    },
    Phone: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The phone type', { build: is.func(), }),
        phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
        extension: utils.check('string', 'The phone extension', { build: is.func(), }),
        primary: utils.check('boolean', 'If the phone is the primary phone or not', { value: is.boolean(), }),
      },
    },
    Address: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The address type', { build: is.func(), }),
        address_1: utils.check('string', 'The address 1', { build: is.func(), }),
        address_2: utils.check('string', 'The address_2', { build: is.func(), }),
        locality: utils.check('string', 'The locality', { build: is.func(), }),
        iso_region: utils.check('string', 'The ISO region / state / province code', { build: is.func(), }),
        postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
        iso_country: utils.check('string', 'The ISO country code', { build: is.func(), }),
        primary: utils.check('boolean', 'If the email address is the primary email address or not', { value: is.boolean(), }),
      },
    },
    Details: {
      type: 'object',
      properties: {
        prefix: utils.check('string', 'The users prefix', { build: is.func(), }),
        first_name: utils.check('string', 'The users first name', { fake: is.string(), }),
        middle_name: utils.check('string', 'The users middle name', { build: is.func(), }),
        last_name: utils.check('string', 'The users last name', { build: is.func(), }),
        suffix: utils.check('string', 'The users suffix', { build: is.func(), }),
        company: utils.check('string', 'The users company', { build: is.func(), }),
        job_title: utils.check('string', 'The users job title', { build: is.func(), }),
        dob: utils.check('string', 'The users date of birth', { build: is.func(), }),
        home_country: utils.check('string', 'The users ISO home country', { build: is.func(), }),
      },
    },
  },
});
