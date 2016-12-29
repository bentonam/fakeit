var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/address_[a-z0-9]+/),
  doc_type: 'address',
  address_id: is.string().uuid(),
  user_id: is.number(),
  address_type: [ 'Home', 'Work', 'Other' ],
  address_1: is.string(),
  address_2: [ is.string(), is.allow(null) ],
  locality: is.string(),
  region: is.string().uppercase().length(2),
  postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
  country: is.string().uppercase().length(2),
});
