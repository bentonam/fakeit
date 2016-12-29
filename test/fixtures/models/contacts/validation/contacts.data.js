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
  details: is.object({
    prefix: [ is.string(), is.allow(null) ],
    first_name: is.string(),
    middle_name: [ is.string(), is.allow(null) ],
    last_name: [ is.string(), is.allow(null) ],
    company: [ is.string(), is.allow(null) ],
    job_title: [ is.string(), is.allow(null) ],
    dob: [ is.date(), is.allow(null) ],
    nickname: [ is.string(), is.allow(null) ],
  })
    .length(8),
  phones: is.array()
    .items(
      is.object({
        type: [ 'Home', 'Work', 'Mobile', 'Main', 'Other' ],
        phone_number: is.string().regex(/[0-9\(\)\-\s\.]+/),
        extension: [ is.string().regex(/[0-9\(\)\-\s\.]+/), is.allow(null) ],
      })
    )
    .min(1)
    .max(3)
    .sparse(false),
  emails: is.array()
    .items(is.string().email())
    .min(1)
    .max(3),
  addresses: is.array()
    .items(
      is.object({
        type: [ 'Home', 'Work', 'Other' ],
        address_1: is.string(),
        address_2: [ is.string(), is.allow(null) ],
        locality: is.string(),
        region: is.string().uppercase().length(2),
        postal_code: is.string().regex(/^[0-9]{5}(?:\-[0-9]{4})?$/).min(5).max(10),
        country: is.string().uppercase().length(2),
      })
    )
    .min(1)
    .max(2)
    .sparse(false),
  children: is.array()
    .items(
      is.object({
        first_name: is.string(),
        gender: [ 'M', 'F', is.allow(null) ],
        age: is.number().min(1).max(17),
      })
    )
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
