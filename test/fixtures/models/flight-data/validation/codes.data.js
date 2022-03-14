const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airport_code_[A-Z0-9]+$/),
  id: is.number().min(0),
  doc_type: 'code',
  designation: 'airport',
  code_type: ['iata', 'icao'],
  code: is.string().uppercase(),
});
