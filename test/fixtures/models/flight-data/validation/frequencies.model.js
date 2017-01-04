var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Frequencies',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    frequency_id: utils.check('integer', 'The frequency id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    airport_id: utils.check('integer', 'The airport id that uses the frequency', { build: is.func(), }),
    airport_ident: utils.check('string', 'The airport identifier', { build: is.func(), }),
    type: utils.check('string', 'The frequency type', { build: is.func(), }),
    description: utils.check('string', 'The frequency description', { build: is.func(), }),
    frequency_mhz: utils.check('float', 'The mhz of the frequency', { build: is.func(), }),
  },
});
