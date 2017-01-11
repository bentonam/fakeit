var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Countries',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: 0,
    max: 0,
    count: 1,
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    country_code: utils.check('string', 'The ISO country code', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    country_name: utils.check('string', 'The country name', { build: is.func(), }),
    continent_code: utils.check('string', 'The ISO continent code the country is located in', { build: is.func(), }),
  },
});
