var is = require('joi');

module.exports = is.object({
  user_id: is.number().min(1).max(1),
  first_name: is.string(),
  last_name: is.string(),
  email_address: is.string().email(),
  home_phone: is.string().regex(/^[0-9\(\)\-\s\.]+$/),
  mobile_phone: is.string().regex(/^[0-9\(\)\-\s\.]+$/),
  address_1: is.string(),
  address_2: [ is.string(), is.allow(null) ],
  locality: is.string(),
  region: is.string().uppercase().length(2),
  postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
  country: is.string().uppercase().length(2)
});
