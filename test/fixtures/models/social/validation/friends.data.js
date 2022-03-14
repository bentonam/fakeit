const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^user_[0-6]_friends$/),
  doc_type: 'user-friends',
  user_id: is.number().min(0).max(6),
  friends: is.array()
    .items({
      user_id: is.number().min(0).max(6),
      date_friended: is.date(),
    })
    .min(0) // has to allow 0 because if only 1 document is created it won't let you to be friends with your self
    .max(200),
});
