var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^like_[a-z0-9-]+$/),
  doc_type: 'like',
  like_id: is.string().uuid(),
  post_id: is.string().uuid(),
  user_id: is.number().min(0).max(6),
  like_date: is.date(),
});
