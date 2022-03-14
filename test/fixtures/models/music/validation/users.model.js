const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  name: 'Users',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  dependants: is.array(),
  key: '_id',
  seed: 0,
  data: {
    min: 400,
    max: 600,
    count: is.number().min(400).max(600),
    dependencies: is.array().length(0),
    inputs: is.array().items(is.string()).length(0),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    type: utils.check('string', 'The document type', { value: is.string() }),
    username: utils.check('string', 'The username', { fake: is.string() }),
    title: utils.check('string', 'The users title', { fake: is.string() }),
    firstName: utils.check('string', 'The users first name', { fake: is.string() }),
    lastName: utils.check('string', 'The users last name', { fake: is.string() }),
    gender: utils.check('string', 'The users gender', { build: is.func() }),
    email: utils.check('string', 'The users email', { fake: is.string() }),
    pwd: utils.check('string', 'The password', { fake: is.string() }),
    address: utils.check('object', 'undefined', { build: is.func() }),
    phones: utils.check('array', 'undefined', { post_build: is.func() }),
    favoriteGenres: utils.check('array', 'undefined', { post_build: is.func() }),
    dateOfBirth: utils.check('string', 'The users birth date', { build: is.func() }),
    status: utils.check('string', 'The users status', { build: is.func() }),
    created: utils.check('string', 'The date the user was created', { fake: is.string(), post_build: is.func() }),
    updated: utils.check('string', 'The date the user document was last updated', { fake: is.string(), post_build: is.func() }),
    picture: utils.check('object', 'User thumbnails / pictures', { build: is.func() }),
  },
});
