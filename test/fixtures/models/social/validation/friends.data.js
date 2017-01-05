var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]_friends$/),
  doc_type: 'user-friends',
  user_id: is.number().min(0).max(6),
  friends: is.array()
    .items({
      user_id: is.number().min(0).max(6),
      date_friended: is.date(),
    })
    .min(1)
    .max(200),
});
