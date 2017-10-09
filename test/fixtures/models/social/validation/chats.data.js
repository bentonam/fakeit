var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^chat_[a-z0-9-]+$/),
  doc_type: 'chat',
  chat_id: is.string().uuid(),
  created_on: is.date(),
  users: is.array().items(is.number().min(1).max(6)).min(1).max(10),
});
