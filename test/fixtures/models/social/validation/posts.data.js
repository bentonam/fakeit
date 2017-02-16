var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^post_[a-z0-9-]+$/),
  doc_type: 'post',
  post_id: is.string().uuid(),
  user_id: is.number().min(0).max(6),
  post_date: is.date(),
  post: is.string(),
  visibility: [ 'public', 'private' ],
  post_access: is.array()
    .items(is.number())
});
