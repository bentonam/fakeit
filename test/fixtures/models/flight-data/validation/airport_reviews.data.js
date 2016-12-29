var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airport_[0-9]+_review_[a-z0-9-]+$/),
  doc_type: 'airport-review',
  review_id: is.string().uuid(),
  airport_id: is.number().min(0),
  airport_code: [ is.string().uppercase(), is.allow(null) ],
  user_id: is.number().min(0).max(6), // this is because it's a depenency and depenency models run 3-6 times
  rating: is.number().min(0).max(5),
  review_title: is.string(),
  review_body: is.string(),
  review_date: is.date(),
});
