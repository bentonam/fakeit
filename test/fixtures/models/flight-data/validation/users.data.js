var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: 'user_1',
  doc_type: 'user',
  user_id: is.number().min(1).max(1),
  account: {
    username: is.string(),
    password: is.string(),
    created_on: is.date(),
    modified_on: is.date(),
    last_login: is.date(),
  },
  details: {
    prefix: [ is.string(), null ],
    first_name: is.string(),
    middle_name: [ is.string(), null ],
    last_name: [ is.string(), null ],
    suffix: [ is.string(), null ],
    company: [ is.string(), null ],
    job_title: [ is.string(), null ],
    dob: [ is.date(), null ],
    home_country: is.string().uppercase().length(2),
  },
  phones: is.array()
    .items({
      type: [ 'Home', 'Work', 'Mobile', 'Main', 'Other', 'Fax' ],
      phone_number: utils.phone,
      extension: [ utils.phone, null ],
      primary: is.boolean(),
    })
    .min(1)
    .max(3)
    .sparse(false),
  emails: is.array()
    .items({
      type: [ 'Home', 'Work', 'Other' ],
      email_address: is.string().email(),
      primary: is.boolean(),
    })
      .min(1)
      .max(3)
      .sparse(false),
  addresses: is.array()
    .items({
      type: [ 'Home', 'Work', 'Other' ],
      address_1: is.string(),
      address_2: [ is.string(), null ],
      locality: is.string(),
      iso_region: is.string().regex(/^[A-Z]{2}.*/),
      postal_code: utils.postal_code,
      iso_country: is.string().uppercase().length(2),
      primary: is.boolean(),
    })
    .min(1)
    .max(2)
    .sparse(false),
});
