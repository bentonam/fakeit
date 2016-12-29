var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^navaid_[0-9]+$/),
  navaid_id: is.number().min(0),
  doc_type: 'navaid',
  navaid_ident: [ is.string().uppercase(), is.allow(null) ],
  navaid_name: [ is.string(), is.allow(null) ],
  type: [ is.string().uppercase(), is.allow(null) ],
  frequency_khz: [ is.number(), is.allow(null) ],
  geo: is.object({
    latitude: [ is.number(), is.allow(null) ],
    longitude: [ is.number(), is.allow(null) ],
  }),
  elevation: [ is.number(), is.allow(null) ],
  iso_country: is.string().uppercase(),
  dme: is.object({
    frequency_khz: [ is.number(), is.allow(null) ],
    channel: [ is.string().regex(/^[A-Z0-9]+$/), is.allow(null) ],
    latitude: [ is.number(), is.allow(null) ],
    longitude: [ is.number(), is.allow(null) ],
    elevation: [ is.number(), is.allow(null) ],
  }),
  magnetic_variation: [ is.number(), is.allow(null) ],
  usage_type: [ is.string().uppercase(), is.allow(null) ],
  power: [ is.string().uppercase(), is.allow(null) ],
  associated_airport_icao_code: [ is.string().uppercase(), is.allow(null) ],
});
