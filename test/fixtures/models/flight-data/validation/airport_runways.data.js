var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airport_[0-9]+_runways$/),
  airport_id: is.number().min(0),
  doc_type: 'airport-runways',
  airport_ident: is.string().uppercase(),
  runways: is.array()
    .items(is.number()),
});
