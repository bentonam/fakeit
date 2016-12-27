var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Users'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(0).max(0),
    count: is.number().min(1000).max(1000),
    dependencies: is.array().length(0),
    inputs: is.object().length(0),
    pre_run: is.func(),
  }),
  properties: is.object({
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
    children: is.object({
      type: utils.types.array,
      description: utils.string('An array of children'),
      items: is.object({
        type: utils.types.object,
        data: is.object({
          min: is.number().min(0).max(0),
          max: is.number().min(5).max(5),
          count: is.number().min(0).max(5),
        }),
        $ref: '#/definitions/Children',
        properties: is.object({
          first_name: utils.check('string', 'The childs first_name', { fake: is.string(), }),
          gender: utils.check('string', 'The childs gender', { build: is.func(), }),
          age: utils.check('integer', 'The childs age', { build: is.func(), }),
        }),
      }),
    }),
  }),
  definitions: is.object({
    Children: is.object({
      type: utils.types.object,
      properties: is.object({
        first_name: utils.check('string', 'The childs first_name', { fake: is.string(), }),
        gender: utils.check('string', 'The childs gender', { build: is.func(), }),
        age: utils.check('integer', 'The childs age', { build: is.func(), }),
      }),
    }),
  }),
});
