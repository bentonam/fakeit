var is = require('joi');

module.exports = is.object({
  id: 'user_0',
  type: 'user',
  user_id: 0,
  first_name: is.string(),
  last_name: is.string(),
  email_address: is.string().email(),
  phone: is.string().regex(/[0-9\(\)\-\s\.]+/),
  active: is.boolean(),
  created_on: is.date(),
});
