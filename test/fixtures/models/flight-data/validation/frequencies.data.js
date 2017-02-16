var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^frequency_[0-9]+$/),
  frequency_id: is.number().min(0),
  doc_type: 'frequency',
  airport_id: is.number().min(0),
  airport_ident: is.string().uppercase(),
  type: is.string().uppercase(),
  description: is.string(),
  frequency_mhz: is.number(),
});
