var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Users',
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: 'id',
  data: is.object({
    min: is.number().min(50).max(50),
    max: is.number().min(100).max(100),
    count: is.number().min(50).max(100),
    dependencies: is.array().length(0),
    inputs: is.object().length(0),
  }),
  properties: is.object({
    id: is.object({
      type: 'null',
      data: is.object({
        post_build: is.func(),
      }),
    }),
    type: is.object({
      type: 'null',
      data: is.object({
        value: is.string(),
      }),
    }),
    user_id: is.object({
      type: 'null',
      data: is.object({
        build: is.func(),
      }),
    }),
    first_name: is.object({
      type: 'null',
      data: is.object({
        fake: is.string(),
      }),
    }),
    last_name: is.object({
      type: 'null',
      description: 'The users last name',
      data: is.object({
        fake: is.string(),
      }),
    }),
    email_address: is.object({
      type: 'null',
      data: is.object({
        fake: is.string(),
      }),
    }),
    phone: is.object({
      type: 'null',
      data: is.object({
        build: is.func(),
      }),
    }),
    active: is.object({
      type: 'null',
      data: is.object({
        build: is.func(),
      }),
    }),
    created_on: is.object({
      type: 'null',
      data: is.object({
        fake: is.string(),
        post_build: is.func(),
      }),
    }),
  }),
});

