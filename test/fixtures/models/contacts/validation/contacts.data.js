var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^contact_[a-z0-9-]{10,}$/),
  doc_type: 'contact',
  channels: is.array()
    .items('ufp-555555555')
    .length(1),
  contact_id: is.string().guid(),
  created_on: is.date(),
  modified_on: is.date(),
  details: {
    prefix: [ is.string(), null ],
    first_name: is.string(),
    middle_name: [ is.string(), null ],
    last_name: [ is.string(), null ],
    company: [ is.string(), null ],
    job_title: [ is.string(), null ],
    dob: [ is.date(), null ],
    nickname: [ is.string(), null ],
  },
  phones: is.array()
    .items({
      type: [ 'Home', 'Work', 'Mobile', 'Main', 'Other' ],
      phone_number: utils.phone,
      extension: [ utils.phone, null ],
    })
    .min(1)
    .max(3)
    .sparse(false),
  emails: is.array()
    .items(is.string().email())
    .min(1)
    .max(3),
  addresses: is.array()
    .items({
      type: [ 'Home', 'Work', 'Other' ],
      address_1: is.string(),
      address_2: [ is.string(), null ],
      locality: is.string(),
      region: is.string().uppercase().length(2),
      postal_code: utils.postal_code,
      country: is.string().uppercase().length(2),
    })
    .min(1)
    .max(2)
    .sparse(false),
  children: is.array()
    .items({
      first_name: is.string(),
      gender: [ 'M', 'F', null ],
      age: is.number().min(1).max(17),
    })
    .min(1)
    .max(8)
    .sparse(false),
  notes: is.string(),
  tags: is.array()
    .items(is.string())
    .min(1)
    .max(6)
    .sparse(false),
});
