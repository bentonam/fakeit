var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Contacts'),
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  type: utils.types.object,
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(200).max(200),
    max: is.number().min(400).max(400),
    count: is.number().min(200).max(400),
    inputs: is.object().length(0),
    dependencies: is.array().length(0),
  }),
  properties: is.object()
    .keys({
      _id: utils.check('string', 'The document id', { post_build: is.func() }),
      doc_type: utils.check('string', 'The document type', { value: utils.string('contact') }),
      channels: utils.check('array', { build: is.func(), }),
      contact_id: utils.check('string', 'The contact_id', { build: is.func() }),
      created_on: utils.check('integer', 'An epoch time of when the contact was created', { build: is.func() }),
      modified_on: utils.check('integer', 'An epoch time of when the contact was last modified', { build: is.func() }),
      details: is.object().keys({
        type: utils.types.object,
        schema: is.object({
          $ref: '#/definitions/Details',
        }),
        description: 'An object of the contacts details',
        properties: is.object({
          prefix: utils.check('string', 'The contacts prefix', { build: is.func() }),
          first_name: utils.check('string', 'The contacts first_name', { fake: utils.string('{{name.firstName}}') }),
          middle_name: utils.check('string', 'The contacts middle_name', { build: is.func() }),
          last_name: utils.check('string', 'The contacts last_name', { build: is.func() }),
          company: utils.check('string', 'The contacts company', { build: is.func() }),
          job_title: utils.check('string', 'The contacts job_title', { build: is.func() }),
          dob: utils.check('string', 'The contacts dob', { build: is.func() }),
          nickname: utils.check('string', 'The contacts nickname', { build: is.func() }),
        }),
        data: is.object(),
      }),
      phones: is.object({
        type: utils.types.array,
        description: utils.string('An array of phone numbers'),
        items: is.object({
          $ref: utils.string('#/definitions/Phone'),
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(3).max(3),
            count: is.number().min(1).max(3),
          }),
          type: utils.types.object,
          properties: is.object({
            type: utils.check('string', 'The phone type', { build: is.func() }),
            phone_number: utils.check('string', 'The phone number', { build: is.func() }),
            extension: utils.check('string', 'The phone extension', { build: is.func() }),
          }),
        }),
      }),
      emails: is.object({
        type: utils.types.array,
        description: utils.string('An array of emails'),
        items: is.object({
          $ref: utils.string('#/definitions/Email'),
          type: utils.types.string,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(2).max(2),
            count: is.number().min(1).max(2),
            build: is.func(),
          }),
        }),
      }),
      addresses: is.object({
        type: utils.types.array,
        description: utils.string('An array of addresses'),
        items: is.object({
          $ref: utils.string('#/definitions/Address'),
          type: utils.types.object,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(2).max(2),
            count: is.number().min(1).max(2),
          }),
          properties: is.object({
            type: utils.check('string', 'The address type', { build: is.func() }),
            address_1: utils.check('string', 'The address 1', { build: is.func() }),
            address_2: utils.check('string', 'The address 2', { build: is.func() }),
            locality: utils.check('string', 'The locality', { build: is.func() }),
            region: utils.check('string', 'The region / state / province', { build: is.func() }),
            postal_code: utils.check('string', 'The zip code / postal code', { build: is.func() }),
            country: utils.check('string', 'The country code', { build: is.func() }),
          }),
        }),
      }),
      children: is.object({
        type: utils.types.array,
        description: utils.string('An array of children'),
        items: is.object({
          $ref: utils.string('#/definitions/Children'),
          type: utils.types.object,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(8).max(8),
            count: is.number().min(1).max(8),
          }),
          properties: is.object({
            first_name: utils.check('string', 'The childs first_name', { fake: utils.string('{{name.firstName}}') }),
            gender: utils.check('string', 'The childs gender', { build: is.func() }),
            age: utils.check('integer', 'The childs age', { build: is.func() }),
          })
        }),
      }),
      notes: utils.check('string', 'Notes about the contact', { fake: utils.string('{{lorem.sentence}}') }),
      tags: is.object({
        type: utils.types.array,
        items: utils.check('string', {
          min: is.number().min(1).max(1),
          max: is.number().min(6).max(6),
          count: is.number().min(1).max(6),
          build: is.func(),
        }),
      }),
    }),
  definitions: is.object({
    Email: utils.check('string', { build: is.func() }),
    Phone: is.object({
      type: utils.types.object,
      properties: is.object({
        type: utils.check('string', 'The phone type', { build: is.func() }),
        phone_number: utils.check('string', 'The phone number', { build: is.func() }),
        extension: utils.check('string', 'The phone extension', { build: is.func() }),
      }),
    }),
    Address: is.object({
      type: utils.types.object,
      properties: is.object({
        type: utils.check('string', 'The address type', { build: is.func() }),
        address_1: utils.check('string', 'The address 1', { build: is.func() }),
        address_2: utils.check('string', 'The address 2', { build: is.func() }),
        locality: utils.check('string', 'The locality', { build: is.func() }),
        region: utils.check('string', 'The region / state / province', { build: is.func() }),
        postal_code: utils.check('string', 'The zip code / postal code', { build: is.func() }),
        country: utils.check('string', 'The country code', { build: is.func() }),
      }),
    }),
    Children: is.object({
      type: utils.types.object,
      properties: is.object({
        first_name: utils.check('string', 'The childs first_name', { fake: utils.string('{{name.firstName}}') }),
        gender: utils.check('string', 'The childs gender', { build: is.func() }),
        age: utils.check('integer', 'The childs age', { build: is.func() }),
      }),
    }),
    Details: is.object({
      type: utils.types.object,
      properties: is.object({
        prefix: utils.check('string', 'The contacts prefix', { build: is.func() }),
        first_name: utils.check('string', 'The contacts first_name', { fake: '{{name.firstName}}' }),
        middle_name: utils.check('string', 'The contacts middle_name', { build: is.func() }),
        last_name: utils.check('string', 'The contacts last_name', { build: is.func() }),
        company: utils.check('string', 'The contacts company', { build: is.func() }),
        job_title: utils.check('string', 'The contacts job_title', { build: is.func() }),
        dob: utils.check('string', 'The contacts dob', { build: is.func() }),
        nickname: utils.check('string', 'The contacts nickname', { build: is.func() }),
      }),
    }),
  }),
});
