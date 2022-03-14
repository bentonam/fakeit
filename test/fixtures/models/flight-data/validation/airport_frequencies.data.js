const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airport_[0-9]+_frequencies$/),
  airport_id: is.number().min(0),
  doc_type: 'airport-frequencies',
  airport_ident: is.string().uppercase(),
  frequencies: is.array()
    .items(is.number()),
});
