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
    min: 0,
    max: 0,
    count: 1000,
    dependencies: is.array().length(0),
    inputs: is.object().length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    user_id: utils.check('integer', 'The users id', { build: is.func(), }),
    first_name: utils.check('string', 'The users first name', { fake: is.string(), }),
    middle_name: utils.check('string', 'The users middle_name', { build: is.func(), }),
    last_name: utils.check('string', 'The users last name', { fake: is.string(), }),
    company: utils.check('string', 'The users company', { build: is.func(), }),
    job_title: utils.check('string', 'The users job title', { build: is.func(), }),
    gender: utils.check('string', 'The users gender', { build: is.func(), }),
    dob: utils.check('string', 'The users dob', { build: is.func(), }),
    created_on: utils.check('integer', 'An epoch time of when the user was created', { fake: is.string(), post_build: is.func(), }),
    children: {
      type: 'array',
      description: 'An array of children',
      items: {
        type: 'object',
        data: {
          min: 0,
          max: 5,
          count: 0,
        },
        $ref: '#/definitions/Children',
        properties: {
          first_name: utils.check('string', 'The childs first_name', { fake: is.string(), }),
          gender: utils.check('string', 'The childs gender', { build: is.func(), }),
          age: utils.check('integer', 'The childs age', { build: is.func(), }),
        },
      },
    },
  },
  definitions: {
    Children: {
      type: 'object',
      properties: {
        first_name: utils.check('string', 'The childs first_name', { fake: is.string(), }),
        gender: utils.check('string', 'The childs gender', { build: is.func(), }),
        age: utils.check('integer', 'The childs age', { build: is.func(), }),
      },
    },
  },
});
