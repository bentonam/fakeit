const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  name: 'Users',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  dependants: is.array(),
  key: '_id',
  seed: 0,
  data: {
    min: 200,
    max: 500,
    count: is.number().min(200).max(500),
    dependencies: is.array().length(0),
    inputs: is.array().items(is.string()).length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    user_id: utils.check('integer', 'The users id', { build: is.func() }),
    first_name: utils.check('string', 'The users first name', { fake: is.string() }),
    last_name: utils.check('string', 'The users last name', { fake: is.string() }),
    username: utils.check('string', 'The users username', { fake: is.string() }),
    password: utils.check('string', 'The users password', { fake: is.string() }),
    email_address: utils.check('string', 'The users email address', { fake: is.string() }),
    home_phone: utils.check('string', 'The users home phone', { fake: is.string(), post_build: is.func() }),
    mobile_phone: utils.check('string', 'The users mobile phone', { fake: is.string(), post_build: is.func() }),
    addresses: utils.check('array', 'An array of addresses', { build: is.func() }),
    created_on: utils.check('integer', 'An epoch time of when the user was created', { fake: is.string(), post_build: is.func() }),
  },
});
