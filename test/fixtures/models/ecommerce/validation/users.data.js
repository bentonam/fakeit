var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[a-z0-9\-]+$/),
  doc_type: 'user',
  user_id: 1,
  first_name: is.string(),
  last_name: is.string(),
  username: is.string(),
  password: is.string(),
  email_address: is.string().email(),
  home_phone: utils.phone,
  mobile_phone: utils.phone,
  addresses: is.array()
    .items({
      type: [ 'Home', 'Work', 'Other' ],
      address_1: is.string(),
      address_2: [ is.string(), null ],
      locality: is.string(),
      region: is.string().uppercase().length(2),
      postal_code: utils.postal_code,
      country: 'US',
    })
    .sparse(false)
    .min(1)
    .max(3),
  created_on: is.date(),
});
