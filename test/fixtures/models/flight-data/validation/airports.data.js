var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/airport_[0-9]+/),
  airport_id: is.number(),
  doc_type: 'airport',
  airport_ident: [ is.string().uppercase(), null ],
  airport_type: [ is.string().regex(/^[a-z][a-z_]+$/), null ],
  airport_name: is.string(),
  geo: {
    latitude: is.number().precision(9),
    longitude: is.number().precision(9),
  },
  elevation: [ is.number(), null ],
  iso_continent: is.string().regex(/^[A-Z]{2}$/),
  iso_country: is.string().regex(/^[A-Z]{2}$/),
  iso_region: [ is.string(), null ],
  municipality: [ is.string(), null ],
  airport_icao: [ is.string().uppercase(), null ],
  airport_iata: [ is.string().uppercase(), null ],
  airport_gps_code: [ is.string().uppercase(), null ],
  airport_local_code: [ is.string().uppercase(), null ],
  timezone_offset: [ is.number().integer(), null ],
  dst: [ is.string().uppercase().length(1), null ],
  timezone: [ is.string().regex(/^[A-Z][A-Za-z_\s]+\/[A-Z][A-Za-z_\s]+$/), null ],
});
