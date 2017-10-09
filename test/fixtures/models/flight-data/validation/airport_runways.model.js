var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'AirportRunways',
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
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.array().items(is.string()).length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    airport_id: utils.check('integer', 'The airport id', { build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    airport_ident: utils.check('string', 'The airports identifer', { build: is.func() }),
    runways: utils.check('array', 'An array of runway ids that belong to the airport', { build: is.func() }),
  },
});
