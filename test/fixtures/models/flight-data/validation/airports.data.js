var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/airport_[0-9]+/),
  airport_id: is.number(),
  doc_type: 'airport',
  airport_ident: [ is.string().uppercase(), is.allow(null) ],
  airport_type: [ is.string().regex(/^[a-z][a-z_]+$/), is.allow(null) ],
  airport_name: is.string(),
  geo: is.object({
    latitude: is.number().precision(9),
    longitude: is.number().precision(9),
  }),
  elevation: [ is.number(), is.allow(null) ],
  iso_continent: is.string().regex(/^[A-Z]{2}$/),
  iso_country: is.string().regex(/^[A-Z]{2}$/),
  iso_region: [ is.string().regex(/^[A-Z\-]+$/), is.allow(null) ],
  municipality: [ is.string(), is.allow(null) ],
  airport_icao: [ is.string().uppercase(), is.allow(null) ],
  airport_iata: [ is.string().uppercase(), is.allow(null) ],
  airport_gps_code: [ is.string().uppercase(), is.allow(null) ],
  airport_local_code: [ is.string().uppercase(), is.allow(null) ],
  timezone_offset: [ is.number().min(0).max(12), is.allow(null) ],
  dst: [ is.string().uppercase().length(1), is.allow(null) ],
  timezone: [ is.string().regex(/^[A-Z][A-Za-z_\s]+\/[A-Z][A-Za-z_\s]+$/), is.allow(null) ],
});
