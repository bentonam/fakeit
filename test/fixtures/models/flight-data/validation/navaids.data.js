const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^navaid_[0-9]+$/),
  navaid_id: is.number().min(0),
  doc_type: 'navaid',
  navaid_ident: [is.string().uppercase(), null],
  navaid_name: [is.string(), null],
  type: [is.string().uppercase(), null],
  frequency_khz: [is.number(), null],
  geo: {
    latitude: [is.number(), null],
    longitude: [is.number(), null],
  },
  elevation: [is.number(), null],
  iso_country: is.string().uppercase(),
  dme: {
    frequency_khz: [is.number(), null],
    channel: [is.string().regex(/^[A-Z0-9]+$/), null],
    latitude: [is.number(), null],
    longitude: [is.number(), null],
    elevation: [is.number(), null],
  },
  magnetic_variation: [is.number(), null],
  usage_type: [is.string().uppercase(), null],
  power: [is.string().uppercase(), null],
  associated_airport_icao_code: [is.string().uppercase(), null],
});
