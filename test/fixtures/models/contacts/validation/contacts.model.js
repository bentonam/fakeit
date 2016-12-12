var is = require('joi');
var escape = require('lodash').escape;

var types = {
  string: is.string().regex(/string/),
  array: is.string().regex(/array/),
  object: is.string().regex(/object/),
  boolean: is.string().regex(/boolean/),
  integer: is.string().regex(/integer/),
};

function string(str) {
  return is.string().regex(new RegExp('^' + escape(str) + '$'));
}

function check(type, description, data) {
  var result = {
    type: types[type]
  };
  if (typeof description !== 'string') {
    data = description;
    description = null;
  }
  if (description) {
    result.description = string(description);
  }

  result.data = is.object(data);

  return is.object(result);
};

module.exports = is.object({
  name: string('Contacts'),
  type: types.object,
  key: string('_id'),
  data: is.object({
    min: is.number().min(200).max(200),
    max: is.number().min(400).max(400),
    fixed: is.number(),
    inputs: is.array().length(0),
  }),
  properties: is.object()
    .keys({
      _id: check('string', 'The document id', { post_build: is.func() }),
      doc_type: check('string', 'The document type', { value: string('contact') }),
      channels: check('array', { build: is.func(), }),
      contact_id: check('string', 'The contact_id', { build: is.func() }),
      created_on: check('integer', 'An epoch time of when the contact was created', { build: is.func() }),
      modified_on: check('integer', 'An epoch time of when the contact was last modified', { build: is.func() }),
      details: is.object().keys({
        type: types.object,
        schema: is.object({
          $ref: '#/definitions/Details',
        }),
        description: 'An object of the contacts details',
        properties: is.object({
          prefix: check('string', 'The contacts prefix', { build: is.func() }),
          first_name: check('string', 'The contacts first_name', { fake: string('{{name.firstName}}') }),
          middle_name: check('string', 'The contacts middle_name', { build: is.func() }),
          last_name: check('string', 'The contacts last_name', { build: is.func() }),
          company: check('string', 'The contacts company', { build: is.func() }),
          job_title: check('string', 'The contacts job_title', { build: is.func() }),
          dob: check('string', 'The contacts dob', { build: is.func() }),
          nickname: check('string', 'The contacts nickname', { build: is.func() }),
        }),
        data: is.object(),
      }),
      phones: is.object({
        type: types.array,
        description: string('An array of phone numbers'),
        items: is.object({
          $ref: string('#/definitions/Phone'),
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(3).max(3),
            fixed: is.number().min(0).max(0),
          }),
          type: types.object,
          properties: is.object({
            type: check('string', 'The phone type', { build: is.func() }),
            phone_number: check('string', 'The phone number', { build: is.func() }),
            extension: check('string', 'The phone extension', { build: is.func() }),
          }),
        }),
      }),
      emails: is.object({
        type: types.array,
        description: string('An array of emails'),
        items: is.object({
          $ref: string('#/definitions/Email'),
          type: types.string,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(2).max(2),
            fixed: is.number().min(0).max(0),
            build: is.func(),
          }),
        }),
      }),
      addresses: is.object({
        type: types.array,
        description: string('An array of addresses'),
        items: is.object({
          $ref: string('#/definitions/Address'),
          type: types.object,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(2).max(2),
            fixed: is.number().min(0).max(0),
          }),
          properties: is.object({
            type: check('string', 'The address type', { build: is.func() }),
            address_1: check('string', 'The address 1', { build: is.func() }),
            address_2: check('string', 'The address 2', { build: is.func() }),
            locality: check('string', 'The locality', { build: is.func() }),
            region: check('string', 'The region / state / province', { build: is.func() }),
            postal_code: check('string', 'The zip code / postal code', { build: is.func() }),
            country: check('string', 'The country code', { build: is.func() }),
          }),
        }),
      }),
      children: is.object({
        type: types.array,
        description: string('An array of children'),
        items: is.object({
          $ref: string('#/definitions/Children'),
          type: types.object,
          data: is.object({
            min: is.number().min(1).max(1),
            max: is.number().min(8).max(8),
            fixed: is.number().min(0).max(0),
          }),
          properties: is.object({
            first_name: check('string', 'The childs first_name', { fake: string('{{name.firstName}}') }),
            gender: check('string', 'The childs gender', { build: is.func() }),
            age: check('integer', 'The childs age', { build: is.func() }),
          })
        }),
      }),
      notes: check('string', 'Notes about the contact', { fake: string('{{lorem.sentence}}') }),
      tags: is.object({
        type: types.array,
        items: check('string', {
          min: is.number().min(1).max(1),
          max: is.number().min(6).max(6),
          fixed: is.number().min(0).max(0),
          build: is.func(),
        }),
      }),
    }),
  definitions: is.object({
    Email: check('string', { build: is.func() }),
    Phone: is.object({
      type: types.object,
      properties: is.object({
        type: check('string', 'The phone type', { build: is.func() }),
        phone_number: check('string', 'The phone number', { build: is.func() }),
        extension: check('string', 'The phone extension', { build: is.func() }),
      }),
    }),
    Address: is.object({
      type: types.object,
      properties: is.object({
        type: check('string', 'The address type', { build: is.func() }),
        address_1: check('string', 'The address 1', { build: is.func() }),
        address_2: check('string', 'The address 2', { build: is.func() }),
        locality: check('string', 'The locality', { build: is.func() }),
        region: check('string', 'The region / state / province', { build: is.func() }),
        postal_code: check('string', 'The zip code / postal code', { build: is.func() }),
        country: check('string', 'The country code', { build: is.func() }),
      }),
    }),
    Children: is.object({
      type: types.object,
      properties: is.object({
        first_name: check('string', 'The childs first_name', { fake: string('{{name.firstName}}') }),
        gender: check('string', 'The childs gender', { build: is.func() }),
        age: check('integer', 'The childs age', { build: is.func() }),
      }),
    }),
    Details: is.object({
      type: types.object,
      properties: is.object({
        prefix: check('string', 'The contacts prefix', { build: is.func() }),
        first_name: check('string', 'The contacts first_name', { fake: '{{name.firstName}}' }),
        middle_name: check('string', 'The contacts middle_name', { build: is.func() }),
        last_name: check('string', 'The contacts last_name', { build: is.func() }),
        company: check('string', 'The contacts company', { build: is.func() }),
        job_title: check('string', 'The contacts job_title', { build: is.func() }),
        dob: check('string', 'The contacts dob', { build: is.func() }),
        nickname: check('string', 'The contacts nickname', { build: is.func() }),
      }),
    }),
  }),
  count: is.number().min(200).max(400),
});
