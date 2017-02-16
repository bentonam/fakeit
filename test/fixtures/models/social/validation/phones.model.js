var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Phones',
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
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    phone_id: utils.check('string', 'The phone id as a GUID', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id the phone is for', { build: is.func(), }),
    phone_type: utils.check('string', 'The phone type', { build: is.func(), }),
    phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
    extension: utils.check('string', 'The phone extension', { build: is.func(), }),
  },
});
