var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Users'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('user_id'),
  data: is.object({
    min: is.number().min(100).max(100),
    max: is.number().min(400).max(400),
    count: is.number().min(100).max(400),
    dependencies: is.array().length(0),
    inputs: is.object().length(0),
  }),
  properties: is.object({
    user_id: utils.check('integer', 'The users id', { build: is.func(), }),
    first_name: utils.check('string', 'The users first name', { fake: is.string(), }),
    last_name: utils.check('string', 'The users last name', { fake: is.string(), }),
    email_address: utils.check('string', 'The users email address', { fake: is.string(), }),
    home_phone: utils.check('string', 'The users home phone', { fake: is.string(), post_build: is.func(), }),
    mobile_phone: utils.check('string', 'The users mobile phone', { fake: is.string(), post_build: is.func(), }),
    address_1: utils.check('string', 'The address 1', { build: is.func(), }),
    address_2: utils.check('string', 'The address_2', { build: is.func(), }),
    locality: utils.check('string', 'The locality', { build: is.func(), }),
    region: utils.check('string', 'The region / state / province', { build: is.func(), }),
    postal_code: utils.check('string', 'The zip code / postal code', { build: is.func(), }),
    country: utils.check('string', 'The country code', { build: is.func(), }),
  }),
})
  .pattern(/_id|[a-z][_a-z]+/, is.string().min(3));
