var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Routes',
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
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    route_id: utils.check('string', 'The route id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    airline_code: utils.check('string', 'The airlines iata / icao code of the source airport', { build: is.func(), }),
    source_airport_code: utils.check('string', 'The source airports iata / icao code', { build: is.func(), }),
    destination_airport_code: utils.check('string', 'The destination airports iata / icao code', { build: is.func(), }),
    codehsare: utils.check('boolean', 'Whether or not the route is a codeshare, meaning it is operated by another airline', { build: is.func(), }),
    stops: utils.check('integer', 'The number of stops on the route', { build: is.func(), }),
    equipment: utils.check('string', 'The equipment used for the route if available, otherwise null', { build: is.func(), }),
    active: utils.check('boolean', 'Whether or not the route is active', { post_build: is.func(), }),
  },
});
