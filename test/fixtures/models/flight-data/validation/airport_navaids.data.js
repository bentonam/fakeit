var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/airport_[0-9]+_navaids/),
  airport_id: is.number().min(0),
  doc_type: 'airport-navaids',
  airport_ident: is.string().uppercase(),
  navaids: is.array()
    .items(is.number()),
});
