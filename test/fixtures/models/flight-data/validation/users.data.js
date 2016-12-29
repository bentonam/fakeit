var is = require('joi');

module.exports = is.object({
  _id: 'user_1',
  doc_type: 'user',
  user_id: is.number().min(1).max(1),
  account: is.object({
    username: is.string(),
    password: is.string(),
    created_on: is.date(),
    modified_on: is.date(),
    last_login: is.date(),
  }),
  details: is.object({
    prefix: [ is.string(), is.allow(null) ],
    first_name: is.string(),
    middle_name: [ is.string(), is.allow(null) ],
    last_name: [ is.string(), is.allow(null) ],
    suffix: [ is.string(), is.allow(null) ],
    company: [ is.string(), is.allow(null) ],
    job_title: [ is.string(), is.allow(null) ],
    dob: [ is.date(), is.allow(null) ],
    home_country: is.string().uppercase().length(2),
  }),
  phones: is.array()
    .items(is.object({
      type: [ 'Home', 'Work', 'Mobile', 'Main', 'Other', 'Fax' ],
      phone_number: is.string().regex(/^[0-9\(\)\-\s\.]+$/),
      extension: [ is.string().regex(/[0-9]+/), is.allow(null) ],
      primary: is.boolean(),
    }))
    .min(1)
    .max(3)
    .sparse(false),
  emails: is.array()
    .items(is.object({
      type: [ 'Home', 'Work', 'Other' ],
      email_address: is.string().email(),
      primary: is.boolean(),
    }))
      .min(1)
      .max(3)
      .sparse(false),
  addresses: is.array()
    .items(is.object({
      type: [ 'Home', 'Work', 'Other' ],
      address_1: is.string(),
      address_2: [ is.string(), is.allow(null) ],
      locality: is.string(),
      iso_region: is.string().regex(/^[A-Z]{2}.*/),
      postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
      iso_country: is.string().uppercase().length(2),
      primary: is.boolean(),
    }))
    .min(1)
    .max(2)
    .sparse(false),
});
