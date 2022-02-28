const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airline_[0-9]+$/),
  doc_type: 'airline',
  airline_id: is.number(),
  airline_name: is.string(),
  airline_iata: [is.string(), null],
  airline_icao: [is.string(), null],
  callsign: [is.string(), null],
  iso_country: [is.string(), null],
  active: is.boolean(),
});
