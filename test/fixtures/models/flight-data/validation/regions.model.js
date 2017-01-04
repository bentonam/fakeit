var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Regions',
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.object().length(1),
    pre_run: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    region_id: utils.check('integer', 'The regions id', { build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    region_code: utils.check('string', 'The ISO region code', { build: is.func(), }),
    local_code: utils.check('string', 'The local code for the region', { build: is.func(), }),
    region_name: utils.check('string', 'The regions name', { build: is.func(), }),
    continent_code: utils.check('string', 'The ISO continent code for the region', { build: is.func(), }),
    iso_country: utils.check('string', 'The ISO country code for the region', { build: is.func(), }),
  }),
});
