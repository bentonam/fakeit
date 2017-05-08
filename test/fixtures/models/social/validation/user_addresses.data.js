var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]_addresses$/),
  doc_type: 'user-addresses',
  user_id: is.number().min(0).max(6),
  addresses: is.array().items(is.string().uuid()),
});
