var is = require('joi');

module.exports = is.object({
  _id: 'user_1',
  doc_type: 'user',
  user_id: 1,
  first_name: is.string(),
  last_name: is.string(),
  username: is.string(),
  password: is.string(),
  emails: is.array()
    .items({
      type: is.string(),
      email_address: is.string().email(),
    })
    .min(1)
    .max(3),
  phones: is.array()
    .items({
      type: is.string(),
      phone_number: is.string().regex(/[0-9\(\)\-\s\.]+/),
      extension: [ is.string().regex(/[0-9\(\)\-\s\.]+/), null ],
    })
    .min(1)
    .max(3),
  addresses: is.array()
    .items({
      type: is.string(),
      address_1: is.string(),
      address_2: [ is.string(), null ],
      locality: is.string(),
      region: is.string(),
      postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
      country: is.string().uppercase().length(2),
    })
    .min(1)
    .max(3),
  created_on: is.date(),
});
