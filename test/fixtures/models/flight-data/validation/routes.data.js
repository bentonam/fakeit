var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^route_[a-z0-9-]+$/),
  route_id: is.string().uuid(),
  doc_type: 'route',
  airline_code: [ is.string().uppercase(), is.allow(null) ],
  source_airport_code: [ is.string().uppercase(), is.allow(null) ],
  destination_airport_code: [ is.string().uppercase(), is.allow(null) ],
  codehsare: is.boolean(),
  stops: is.number().min(0),
  equipment: [ is.string(), is.allow(null) ],
  active: is.boolean(),
});
