var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^continent_[A-Z0-9]+$/),
  continent_code: is.string().uppercase(),
  doc_type: 'continent',
  continent_name: is.string().regex(/^[A-Z][A-ZZa-z\s]+$/),
});
