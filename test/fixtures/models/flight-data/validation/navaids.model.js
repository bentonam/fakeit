var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Navaids',
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
    post_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    navaid_id: utils.check('integer', 'The navaid id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    navaid_ident: utils.check('string', 'The The navaid identifer code if available, otherwise null', { build: is.func(), }),
    navaid_name: utils.check('string', 'The name of the navaid if available, otherwise null', { build: is.func(), }),
    type: utils.check('string', 'The type of navaid if available, otherwise null', { build: is.func(), }),
    frequency_khz: utils.check('float', 'The frequency in khz of the navaid if available, otherwise null', { build: is.func(), }),
    geo: {
      data: is.object().length(0),
      type: 'object',
      properties: {
        latitude: utils.check('float', 'The latitude of the navaid if available, otherwise null', { build: is.func() }),
        longitude: utils.check('float', 'The longitude of the navaid if available, otherwise null', { build: is.func() }),
      },
    },
    elevation: utils.check('integer', 'The elevation in ft of the navaid if available, otherwise null', { build: is.func(), }),
    iso_country: utils.check('string', 'The ISO country code that the navaid is in', { build: is.func(), }),
    dme: {
      data: is.object().length(0),
      type: 'object',
      properties: {
        frequency_khz: utils.check('float', 'The frequency in khz an associated DME if available, otherwise null', { build: is.func(), }),
        channel: utils.check('string', 'The DME channel if available, otherwise null', { build: is.func(), }),
        latitude: utils.check('float', 'The DME latitude of the navaid if available, otherwise null', { build: is.func(), }),
        longitude: utils.check('float', 'The DME longitude in khz of the navaid if available, otherwise null', { build: is.func(), }),
        elevation: utils.check('float', 'The elevation of the DME in ft if available, otherwise null', { build: is.func(), }),
      },
    },
    magnetic_variation: utils.check('float', 'The magnetic variation at the navaid\'s location if available, otherwise null', { build: is.func(), }),
    usage_type: utils.check('string', 'The usage type of the navaid if available, otherwise null', { build: is.func(), }),
    power: utils.check('string', 'The navaid\'s power if available, otherwise null', { build: is.func(), }),
    associated_airport_icao_code: utils.check('string', 'An airport icao_code or ident that the navaid is associated with if available, otherwise null', { build: is.func(), }), // eslint-disable-line
  },
});
