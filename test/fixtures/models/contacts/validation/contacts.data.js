var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^contact_[a-z0-9-]{10,}$/),
  doc_type: is.string().regex(/contact/),
  channels: is.array().required(), // should this have stuff in it?
  contact_id: is.string().required().regex(/^[a-z0-9-]{10,}$/),
  created_on: is.date().required(),
  modified_on: is.date().required(),
  details: is.object()
    .length(8)
    .with('prefix', 'first_name', 'middle_name', 'last_name', 'company', 'job_title', 'dob', 'nickname'),
  phones: is.array()
    .required()
    .min(1)
    .max(3)
    .items(
      is.object()
        .min(2)
        .max(3)
        .with('type', 'phone_number', 'extension')
    ),
  emails: is.array()
    .required()
    .min(1)
    .max(3)
    .items(is.string().email()),
  addresses: is.array()
    .required()
    .min(1)
    .max(2)
    .items(
      is.object()
        .with('type', 'address_1', 'address_2', 'locality', 'region', 'postal_code', 'country')
    ),
  children: is.array()
    .required()
    .min(1)
    .max(8)
    .items(
      is.object()
        .with('first_name', 'gender', 'age')
    ),
  notes: is.string().required(),
  tags: is.array()
    .required()
    .min(1)
    .max(6)
    .items(is.string())
})
  .pattern(/_id|[a-z][_a-z]+/, is.string().min(3));
