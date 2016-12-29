var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airline_[0-9]+$/),
  doc_type: 'airline',
  airline_id: is.number(),
  airline_name: is.string(),
  airline_iata: [ is.string(), is.allow(null) ],
  airline_icao: [ is.string(), is.allow(null) ],
  callsign: [ is.string(), is.allow(null) ],
  iso_country: [ is.string(), is.allow(null) ],
  active: is.boolean(),
});
