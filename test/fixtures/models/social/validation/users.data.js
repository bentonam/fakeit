var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]$/),
  doc_type: 'user',
  user_id: is.number().min(0).max(6),
  first_name: is.string(),
  middle_name: [ is.string(), is.allow(null) ],
  last_name: is.string(),
  company: [ is.string(), is.allow(null) ],
  job_title: [ is.string(), is.allow(null) ],
  gender: [ 'M', 'F', is.allow(null) ],
  dob: [ is.date(), is.allow(null) ],
  created_on: is.date(),
  children: is.array()
    .items({
      first_name: is.string(),
      gender: [ 'M', 'F', is.allow(null) ],
      age: is.number().min(1).max(17),
    })
    .min(0)
    .max(5),
});
