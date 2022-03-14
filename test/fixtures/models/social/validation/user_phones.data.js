const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]_phones$/),
  doc_type: 'user-phones',
  user_id: is.number().min(0).max(6),
  phones: is.array()
    .items(is.string().uuid()),
});
