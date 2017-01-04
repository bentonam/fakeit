var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^phone_[a-z0-9-]+$/),
  doc_type: 'phone',
  phone_id: is.string().uuid(),
  user_id: is.number().min(0).max(6),
  phone_type: [ 'Home', 'Work', 'Mobile', 'Main', 'Other' ],
  phone_number: utils.phone,
  extension: [ utils.phone, null ]
});
