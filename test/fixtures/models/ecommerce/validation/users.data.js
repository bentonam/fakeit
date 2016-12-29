var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[a-z0-9\-]+$/),
  doc_type: 'user',
  user_id: is.number().min(1).max(1),
  first_name: is.string(),
  last_name: is.string(),
  username: is.string(),
  password: is.string(),
  email_address: is.string().email(),
  home_phone: is.string().regex(/[0-9\(\)\-\s\.]+/),
  mobile_phone: is.string().regex(/[0-9\(\)\-\s\.]+/),
  addresses: is.array()
    .items(is.object({
      type: [ 'Home', 'Work', 'Other' ],
      address_1: is.string(),
      address_2: [ is.string(), is.allow(null) ],
      locality: is.string(),
      region: is.string().uppercase().length(2),
      postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
      country: 'US',
    }))
    .sparse(false)
    .min(1)
    .max(3),
  created_on: is.date(),
});
