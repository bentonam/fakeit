const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^message_[a-z0-9-]+$/),
  doc_type: 'chat-message',
  message_id: is.string().uuid(),
  chat_id: is.string().uuid(),
  user_id: is.number(),
  message_date: is.date(),
  message: is.string(),
});
