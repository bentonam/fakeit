var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Airports'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
    post_build: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    airport_id: utils.check('integer', 'The airports id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    airport_ident: utils.check('string', 'The airport identifier if available, otherwise null', { build: is.func(), }),
    airport_type: utils.check('string', 'The airport type if available, otherwise null', { build: is.func(), }),
    airport_name: utils.check('string', 'The airport name if available, otherwise null', { build: is.func(), }),
    geo: is.object({
      data: is.object().length(0),
      type: utils.types.object,
      properties: is.object({
        latitude: utils.check('float', 'The airports latitude if available, otherwise null', { build: is.func() }),
        longitude: utils.check('float', 'The airport longitude if available, otherwise null', { build: is.func() }),
      }),
    }),
    elevation: utils.check('integer', 'The airport elevation in ft if available, otherwise null', { build: is.func(), }),
    iso_continent: utils.check('string', 'The ISO continent code for the airport', { build: is.func(), }),
    iso_country: utils.check('string', 'The ISO country code for the airport', { build: is.func(), }),
    iso_region: utils.check('string', 'The ISO region code the airport is in if available, otherwise null', { build: is.func(), }),
    municipality: utils.check('string', 'The airport city if available, otherwise null', { build: is.func(), }),
    airport_icao: utils.check('string', 'The airport 4 character icao code if available, otherwise null', { build: is.func(), }),
    airport_iata: utils.check('string', 'The airport 3 letter iata / faa code if available, otherwise null', { build: is.func(), }),
    airport_gps_code: utils.check('string', 'The airports gps_code if available, otherwise null', { build: is.func(), }),
    airport_local_code: utils.check('string', 'The airports local code if available, otherwise null', { build: is.func(), }),
    timezone_offset: utils.check('integer', 'The airports timezone offset if available, otherwise null', { build: is.func(), }),
    dst: utils.check('string', 'The airports daylight savings type if available, otherwise null', { build: is.func(), }),
    timezone: utils.check('string', 'The airports timezone if available, otherwise null', { build: is.func(), }),
  }).unknown(),
});
