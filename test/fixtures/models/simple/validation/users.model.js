var is = require('joi');

module.exports = is.object({
  name: 'Users',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: 'id',
  seed: 0,
  data: {
    min: 50,
    max: 100,
    count: is.number().min(50).max(100),
    dependencies: is.array().length(0),
    inputs: is.object().length(0),
  },
  properties: {
    id: {
      type: 'null',
      data: { post_build: is.func(), },
    },
    type: {
      type: 'null',
      data: { value: is.string(), },
    },
    user_id: {
      type: 'null',
      data: { build: is.func(), },
    },
    first_name: {
      type: 'null',
      data: { fake: is.string(), },
    },
    last_name: {
      type: 'null',
      description: 'The users last name',
      data: { fake: is.string(), },
    },
    email_address: {
      type: 'null',
      data: { fake: is.string(), },
    },
    phone: {
      type: 'null',
      data: { build: is.func(), },
    },
    active: {
      type: 'null',
      data: { build: is.func(), },
    },
    created_on: {
      type: 'null',
      data: { fake: is.string(), post_build: is.func(), },
    },
  },
});

