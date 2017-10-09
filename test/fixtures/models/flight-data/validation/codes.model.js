var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Codes',
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
    id: utils.check('integer', 'The id of the airline, airport, or navaid the code is for', { build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    designation: utils.check('string', 'The designation of the code, can be airline, airport, or navaid', { build: is.func() }),
    code_type: utils.check('string', 'The type of code, can be iata, icao, ident', { build: is.func() }),
    code: utils.check('string', 'The document type', { build: is.func() }),
  },
});
