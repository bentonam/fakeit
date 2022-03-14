const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^review_[a-z0-9\-]+$/),
  doc_type: 'review',
  review_id: is.string().uuid(),
  product_id: is.string().uuid(),
  user_id: is.number().max(6),
  reviewer_name: is.string(),
  reviewer_email: is.string().email(),
  rating: is.number().min(0).max(5),
  review_title: is.string(),
  review_body: is.string(),
  review_date: is.date(),
});
