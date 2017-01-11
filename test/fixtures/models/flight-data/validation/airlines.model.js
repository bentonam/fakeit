var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Airlines',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  seed: 0,
  data: {
    min: 0,
    max: 0,
    count: 1,
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.object().length(1),
    pre_run: is.func(),
    post_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    airline_id: utils.check('integer', 'The airlines id', { pre_build: is.func(), }),
    airline_name: utils.check('string', 'The name of the airline', { build: is.func(), }),
    airline_iata: utils.check('string', 'The airlines iata code if availabe, otherwise null', { build: is.func(), }),
    airline_icao: utils.check('string', 'The airlines icao code if available, otherwise null', { build: is.func(), }),
    callsign: utils.check('string', 'The airlines callsign if available', { build: is.func(), }),
    iso_country: utils.check('string', 'The ISO country code the airline is based in', { build: is.func(), }),
    active: utils.check('boolean', 'Whether or not the airline is active', { pre_build: is.func(), post_build: is.func(), }),
  },
});
