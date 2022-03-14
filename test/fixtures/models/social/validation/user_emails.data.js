const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]_emails$/),
  doc_type: 'user-emails',
  user_id: is.number().min(0).max(6),
  emails: is.array()
    .items(is.string().uuid()),
});
