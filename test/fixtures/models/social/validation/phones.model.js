var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Phones',
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.object().length(0),
    pre_run: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    phone_id: utils.check('string', 'The phone id as a GUID', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id the phone is for', { build: is.func(), }),
    phone_type: utils.check('string', 'The phone type', { build: is.func(), }),
    phone_number: utils.check('string', 'The phone number', { build: is.func(), }),
    extension: utils.check('string', 'The phone extension', { build: is.func(), }),
  }),
});
