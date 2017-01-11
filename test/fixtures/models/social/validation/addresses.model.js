var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Addresses',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: 0,
    max: 0,
    count: 1,
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.object().length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    address_id: utils.check('string', 'The address id as a GUID', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id the address is for', { build: is.func(), }),
    address_type: utils.check('string', 'The address type', { build: is.func(), }),
    address_1: utils.check('string', 'The address 1', { build: is.func(), }),
    address_2: utils.check('string', 'The address_2', { build: is.func(), }),
    locality: utils.check('string', 'The locality', { build: is.func(), }),
    region: utils.check('string', 'The region / state / province', { build: is.func(), }),
    postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
    country: utils.check('string', 'The country code', { build: is.func(), })
  },
});
