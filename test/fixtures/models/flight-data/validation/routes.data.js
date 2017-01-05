var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^route_[a-z0-9-]+$/),
  route_id: is.string().uuid(),
  doc_type: 'route',
  airline_code: [ is.string().uppercase(), null ],
  source_airport_code: [ is.string().uppercase(), null ],
  destination_airport_code: [ is.string().uppercase(), null ],
  codehsare: is.boolean(),
  stops: is.number().min(0),
  equipment: [ is.string(), null ],
  active: is.boolean(),
});
