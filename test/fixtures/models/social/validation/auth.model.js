var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Auth',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.object().length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    username: utils.check('string', 'The users username', { fake: is.string(), }),
    password: utils.check('string', 'The users password', { fake: is.string(), }),
    user_id: utils.check('integer', 'The users id', { build: is.func(), }),
  },
});
