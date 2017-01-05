var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'AirportNavaids',
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
    airport_id: utils.check('integer', 'The airport id', { pre_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    airport_ident: utils.check('string', 'The airports identifier', { pre_build: is.func(), }),
    navaids: utils.check('array', 'An array of navaid_ids', { build: is.func(), }),
  },
});
