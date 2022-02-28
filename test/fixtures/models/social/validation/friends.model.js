const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  name: 'Friends',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  dependants: is.array(),
  key: '_id',
  seed: 0,
  data: {
    min: 0,
    max: 0,
    count: 1,
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.array().items(is.string()).length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    user_id: utils.check('integer', 'The user_id the lookup is for', { build: is.func() }),
    friends: utils.check('array', 'An array of friends (user_id)', { post_build: is.func() }),
  },
});
