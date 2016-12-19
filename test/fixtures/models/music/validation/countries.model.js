var is = require('joi');
var escape = require('lodash').escape;

var types = {
  string: is.string().regex(/string/),
  array: is.string().regex(/array/),
  object: is.string().regex(/object/),
  boolean: is.string().regex(/boolean/),
  integer: is.string().regex(/integer/),
};

function string(str) {
  return is.string().regex(new RegExp('^' + escape(str) + '$'));
}

function check(type, description, data) {
  var result = {
    type: types[type]
  };
  if (typeof description !== 'string') {
    data = description;
    description = null;
  }
  if (description) {
    result.description = string(description);
  }

  result.data = is.object(data);

  return is.object(result);
};

module.exports = is.object({
  name: string('Countries'),
  type: types.object,
  key: string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(0).max(0),
    count: is.number().min(0).max(0),
    inputs: is.object({
      countries: is.array()
        .items(is.object({
          name: is.string(),
          iso_2: is.string().uppercase().length(2),
          iso_3: is.string().uppercase().length(3),
          iso_m49: is.number(),
        }))
        .length(247),
    }),
    pre_run: is.func(),
    pre_build: is.func(),
  }),
  properties: is.object({
    _id: check('string', 'The document id', { post_build: is.func() }),
    gdp: check('integer', 'The countries GDP', { build: is.func() }),
    country_code: check('string', 'The 2 letter ISO country code', { pre_build: is.func() }),
    'region-number': check('string', 'The countries region number', { build: is.func() }),
    name: check('string', 'The name of the country', { build: is.func() }),
    updated: check('string', 'The date the country was last updated', { fake: string('{{date.past}}'), post_build: is.func() }),
    population: check('integer', 'The countries population', { build: is.func() }),
  }),
  count: is.number().max(1).min(1),
});
