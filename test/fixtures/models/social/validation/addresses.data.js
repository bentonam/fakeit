var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/address_[a-z0-9]+/),
  doc_type: 'address',
  address_id: is.string().uuid(),
  user_id: is.number(),
  address_type: [ 'Home', 'Work', 'Other' ],
  address_1: is.string(),
  address_2: [ is.string(), null ],
  locality: is.string(),
  region: is.string().uppercase().length(2),
  postal_code: utils.postal_code,
  country: is.string().uppercase().length(2),
});
