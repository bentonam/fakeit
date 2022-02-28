const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^country_[A-Z]{2}$/),
  country_code: is.string().uppercase().length(2),
  doc_type: 'country',
  country_name: is.string().regex(/[A-Z].*/),
  continent_code: is.string().uppercase().length(2),
});
