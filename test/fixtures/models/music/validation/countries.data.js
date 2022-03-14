const is = require('joi');

module.exports = is.object({
  _id: is.string(),
  gdp: is.number(),
  country_code: is.string().uppercase().length(2),
  name: is.string(),
  updated: is.date(),
  'region-number': is.string(),
  population: is.number(),
});
