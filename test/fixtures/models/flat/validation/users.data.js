var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  user_id: 1,
  first_name: is.string(),
  last_name: is.string(),
  email_address: is.string().email(),
  home_phone: utils.phone,
  mobile_phone: utils.phone,
  address_1: is.string(),
  address_2: [ is.string(), null ],
  locality: is.string(),
  region: is.string().uppercase().length(2),
  postal_code: utils.postal_code,
  country: is.string().uppercase().length(2)
});
