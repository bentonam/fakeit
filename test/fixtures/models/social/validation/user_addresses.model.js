var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'UserAddresses',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.object().length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    user_id: utils.check('integer', 'The user_id the lookup is for', { build: is.func(), }),
    addresses: utils.check('array', 'The address id', { build: is.func(), }),
  },
});
