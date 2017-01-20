var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Contacts',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  type: 'object',
  key: '_id',
  seed: 0,
  data: {
    min: 200,
    max: 400,
    count: is.number().min(200).max(400),
    inputs: is.object().length(0),
    dependencies: is.array().length(0),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: 'contact' }),
    channels: utils.check('array', { build: is.func(), }),
    contact_id: utils.check('string', 'The contact_id', { build: is.func() }),
    created_on: utils.check('integer', 'An epoch time of when the contact was created', { build: is.func() }),
    modified_on: utils.check('integer', 'An epoch time of when the contact was last modified', { build: is.func() }),
    details: {
      type: 'object',
      schema: {
        $ref: '#/definitions/Details',
      },
      description: 'An object of the contacts details',
      properties: {
        prefix: utils.check('string', 'The contacts prefix', { build: is.func() }),
        first_name: utils.check('string', 'The contacts first_name', { fake: '{{name.firstName}}' }),
        middle_name: utils.check('string', 'The contacts middle_name', { build: is.func() }),
        last_name: utils.check('string', 'The contacts last_name', { build: is.func() }),
        company: utils.check('string', 'The contacts company', { build: is.func() }),
        job_title: utils.check('string', 'The contacts job_title', { build: is.func() }),
        dob: utils.check('string', 'The contacts dob', { build: is.func() }),
        nickname: utils.check('string', 'The contacts nickname', { build: is.func() }),
      },
      data: is.object(),
    },
    phones: {
      type: 'array',
      description: 'An array of phone numbers',
      items: {
        $ref: '#/definitions/Phone',
        data: {
          min: 1,
          max: 3,
          count: 0,
        },
        type: 'object',
        properties: {
          type: utils.check('string', 'The phone type', { build: is.func() }),
          phone_number: utils.check('string', 'The phone number', { build: is.func() }),
          extension: utils.check('string', 'The phone extension', { build: is.func() }),
        },
      },
    },
    emails: {
      type: 'array',
      description: 'An array of emails',
      items: {
        $ref: '#/definitions/Email',
        type: 'string',
        data: {
          min: 1,
          max: 2,
          count: 0,
          build: is.func(),
        },
      },
    },
    addresses: {
      type: 'array',
      description: 'An array of addresses',
      items: {
        $ref: '#/definitions/Address',
        type: 'object',
        data: {
          min: 1,
          max: 2,
          count: 0,
        },
        properties: {
          type: utils.check('string', 'The address type', { build: is.func() }),
          address_1: utils.check('string', 'The address 1', { build: is.func() }),
          address_2: utils.check('string', 'The address 2', { build: is.func() }),
          locality: utils.check('string', 'The locality', { build: is.func() }),
          region: utils.check('string', 'The region / state / province', { build: is.func() }),
          postal_code: utils.check('string', 'The zip code / postal code', { build: is.func() }),
          country: utils.check('string', 'The country code', { build: is.func() }),
        },
      },
    },
    children: {
      type: 'array',
      description: 'An array of children',
      items: {
        $ref: '#/definitions/Children',
        type: 'object',
        data: {
          min: 1,
          max: 8,
          count: 0,
        },
        properties: {
          first_name: utils.check('string', 'The childs first_name', { fake: '{{name.firstName}}' }),
          gender: utils.check('string', 'The childs gender', { build: is.func() }),
          age: utils.check('integer', 'The childs age', { build: is.func() }),
        },
      },
    },
    notes: utils.check('string', 'Notes about the contact', { fake: '{{lorem.sentence}}' }),
    tags: {
      type: 'array',
      items: utils.check('string', {
        min: 1,
        max: 6,
        count: 0,
        build: is.func(),
      }),
    },
  },
  definitions: {
    Email: utils.check('string', { build: is.func() }),
    Phone: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The phone type', { build: is.func() }),
        phone_number: utils.check('string', 'The phone number', { build: is.func() }),
        extension: utils.check('string', 'The phone extension', { build: is.func() }),
      },
    },
    Address: {
      type: 'object',
      properties: {
        type: utils.check('string', 'The address type', { build: is.func() }),
        address_1: utils.check('string', 'The address 1', { build: is.func() }),
        address_2: utils.check('string', 'The address 2', { build: is.func() }),
        locality: utils.check('string', 'The locality', { build: is.func() }),
        region: utils.check('string', 'The region / state / province', { build: is.func() }),
        postal_code: utils.check('string', 'The zip code / postal code', { build: is.func() }),
        country: utils.check('string', 'The country code', { build: is.func() }),
      },
    },
    Children: {
      type: 'object',
      properties: {
        first_name: utils.check('string', 'The childs first_name', { fake: '{{name.firstName}}' }),
        gender: utils.check('string', 'The childs gender', { build: is.func() }),
        age: utils.check('integer', 'The childs age', { build: is.func() }),
      },
    },
    Details: {
      type: 'object',
      properties: {
        prefix: utils.check('string', 'The contacts prefix', { build: is.func() }),
        first_name: utils.check('string', 'The contacts first_name', { fake: '{{name.firstName}}' }),
        middle_name: utils.check('string', 'The contacts middle_name', { build: is.func() }),
        last_name: utils.check('string', 'The contacts last_name', { build: is.func() }),
        company: utils.check('string', 'The contacts company', { build: is.func() }),
        job_title: utils.check('string', 'The contacts job_title', { build: is.func() }),
        dob: utils.check('string', 'The contacts dob', { build: is.func() }),
        nickname: utils.check('string', 'The contacts nickname', { build: is.func() }),
      },
    },
  },
});
