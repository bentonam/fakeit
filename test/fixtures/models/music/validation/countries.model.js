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
    inputs: {
      countries: is.array()
        .items({
          name: is.string(),
          iso_2: is.string().uppercase().length(2),
          iso_3: is.string().uppercase().length(3),
          iso_m49: is.number(),
        })
        .length(247),
    },
    dependencies: is.array().length(0),
    pre_run: is.func(),
    pre_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    gdp: utils.check('integer', 'The countries GDP', { build: is.func() }),
    country_code: utils.check('string', 'The 2 letter ISO country code', { pre_build: is.func() }),
    'region-number': utils.check('string', 'The countries region number', { build: is.func() }),
    name: utils.check('string', 'The name of the country', { build: is.func() }),
    updated: utils.check('string', 'The date the country was last updated', { fake: '{{date.past}}', post_build: is.func() }),
    population: utils.check('integer', 'The countries population', { build: is.func() }),
  },
});
