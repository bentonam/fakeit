var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^email_[a-z0-9-]+$/),
  doc_type: 'email',
  email_id: is.string().uuid(),
  user_id: is.number().min(1).max(6),
  email_type: [ 'Home', 'Work', 'Other' ],
  email_address: is.string().email(),
});
