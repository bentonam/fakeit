var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Navaids'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(0).max(0),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
    post_build: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    navaid_id: utils.check('integer', 'The navaid id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    navaid_ident: utils.check('string', 'The The navaid identifer code if available, otherwise null', { build: is.func(), }),
    navaid_name: utils.check('string', 'The name of the navaid if available, otherwise null', { build: is.func(), }),
    type: utils.check('string', 'The type of navaid if available, otherwise null', { build: is.func(), }),
    frequency_khz: utils.check('float', 'The frequency in khz of the navaid if available, otherwise null', { build: is.func(), }),
    geo: is.object({
      data: is.object().length(0),
      type: utils.types.object,
      properties: is.object({
        latitude: utils.check('float', 'The latitude of the navaid if available, otherwise null', { build: is.func() }),
        longitude: utils.check('float', 'The longitude of the navaid if available, otherwise null', { build: is.func() }),
      }),
    }),
    elevation: utils.check('integer', 'The elevation in ft of the navaid if available, otherwise null', { build: is.func(), }),
    iso_country: utils.check('string', 'The ISO country code that the navaid is in', { build: is.func(), }),
    // dme: utils.check('object', 'undefined', {  }),
    magnetic_variation: utils.check('float', 'The magnetic variation at the navaid\'s location if available, otherwise null', { build: is.func(), }),
    usage_type: utils.check('string', 'The usage type of the navaid if available, otherwise null', { build: is.func(), }),
    power: utils.check('string', 'The navaid\'s power if available, otherwise null', { build: is.func(), }),
    associated_airport_icao_code: utils.check('string', 'An airport icao_code or ident that the navaid is associated with if available, otherwise null', { build: is.func(), }), // eslint-disable-line
  }).unknown(),
});
