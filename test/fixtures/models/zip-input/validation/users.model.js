var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Users',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: is.number().min(100).max(100),
    max: is.number().min(500).max(500),
    count: is.number().min(100).max(500),
    dependencies: is.array().length(0),
    inputs: {
      address: {
        types: is.array().items(is.string()).length(3)
      },
      email: {
        types: is.array().items(is.string()).length(3)
      },
      phone: {
        types: is.array().items(is.string()).length(8)
      },
      countries: is.array()
        .items({
          code: is.string().uppercase(),
          name: is.string().regex(/[A-Z].+/),
        }).length(247),
      regions: is.array()
        .items({
          code: is.string().regex(/[A-Z0-9-]{4,}/),
          name: is.string(),
          iso_country: is.string().uppercase(),
        })
        .length(3999),
    },
    pre_run: is.func(),
    pre_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    user_id: utils.check('integer', 'The users id', { build: is.func(), }),
    first_name: utils.check('string', 'The users first name', { fake: is.string(), }),
    last_name: utils.check('string', 'The users last name', { fake: is.string(), }),
    username: utils.check('string', 'The users username', { fake: is.string(), }),
    password: utils.check('string', 'The users password', { fake: is.string(), }),
    emails: {
      type: 'array',
      description: 'An array of emails',
      items: {
        data: {
          min: is.number().min(1).max(1),
          max: is.number().min(3).max(3),
          count: is.number().min(1).max(3),
        },
        $ref: '#/definitions/Email',
        type: 'object',
        properties: {
          type: utils.check('string', 'The email type', { build: is.func(), }),
          email_address: utils.check('string', 'The phone number', { build: is.func(), }),
        },
      },
    },
    phones: {
      type: 'array',
      description: 'An array of phone numbers',
      items: {
        data: {
          min: is.number().min(1).max(1),
          max: is.number().min(3).max(3),
          count: is.number().min(1).max(3),
        },
        $ref: '#/definitions/Phone',
        type: 'object',
        properties: {
          type: utils.check('string', 'The phone type', { build: is.func(), }),
          phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
          extension: utils.check('string', 'The phone extension', { build: is.func(), }),
        },
      },
    },
    addresses: {
      type: 'array',
      description: 'An array of addresses',
      items: {
        data: {
          min: is.number().min(1).max(1),
          max: is.number().min(3).max(3),
          count: is.number().min(1).max(3),
        },
        $ref: '#/definitions/Address',
        type: 'object',
        properties: {
          type: utils.check('string', 'The address type', { build: is.func(), }),
          address_1: utils.check('string', 'The address 1', { build: is.func(), }),
          address_2: utils.check('string', 'The address_2', { build: is.func(), }),
          locality: utils.check('string', 'The locality', { build: is.func(), }),
          region: utils.check('string', 'The region / state / province', { build: is.func(), }),
          postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
          country: utils.check('string', 'The country code', { build: is.func(), }),
        },
      },
    },
    created_on: utils.check('integer', 'An epoch time of when the user was created', { fake: is.string(), post_build: is.func(), }),
  },
  definitions: {
    Email: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The email type', { build: is.func(), }),
        email_address: utils.check('string', 'The phone number', { build: is.func(), }),
      },
    },
    Phone: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The phone type', { build: is.func(), }),
        phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
        extension: utils.check('string', 'The phone extension', { build: is.func(), }),
      },
    },
    Address: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The address type', { build: is.func(), }),
        address_1: utils.check('string', 'The address 1', { build: is.func(), }),
        address_2: utils.check('string', 'The address_2', { build: is.func(), }),
        locality: utils.check('string', 'The locality', { build: is.func(), }),
        region: utils.check('string', 'The region / state / province', { build: is.func(), }),
        postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
        country: utils.check('string', 'The country code', { build: is.func(), }),
      },
    },
  },
});
