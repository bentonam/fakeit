const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[1-6]_auth$/),
  doc_type: 'user-auth',
  username: is.string(),
  password: is.string(),
  user_id: is.number(),
});
