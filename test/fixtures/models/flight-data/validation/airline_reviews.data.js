const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^airline_[0-9]+_review_[a-z0-9-]+$/),
  doc_type: 'airline-review',
  review_id: is.string().uuid(),
  airline_id: is.number(),
  airline_code: is.string().regex(/^[A-Z0-9]+$/),
  user_id: is.number(),
  rating: is.number().min(0).max(5),
  review_title: is.string(),
  review_body: is.string(),
  review_date: is.date(),
});
