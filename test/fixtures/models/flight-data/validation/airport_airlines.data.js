var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airport_[0-9-]+_airlines$/),
  airport_id: is.number().min(0),
  doc_type: 'airport-airlines',
  airport_ident: is.string().uppercase(),
  airlines: is.array().items(is.string().uppercase()),
});
