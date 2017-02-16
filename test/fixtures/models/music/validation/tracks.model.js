var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Tracks',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  dependants: is.array(),
  key: '_id',
  seed: 0,
  data: {
    min: 500,
    max: 800,
    count: is.number().min(500).max(800),
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.array().items(is.string()).length(0),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    type: utils.check('string', 'The document type', { value: is.string(), }),
    id: utils.check('string', 'Unique identifier representing a specific track', { build: is.func(), }),
    created: utils.check('string', 'The date the track was created', { fake: is.string(), post_build: is.func(), }),
    updated: utils.check('string', 'The date the track was updated', { fake: is.string(), post_build: is.func(), }),
    artist: utils.check('string', 'The artist name title', { build: is.func(), }),
    title: utils.check('string', 'The track title', { fake: is.string(), }),
    mp3: utils.check('string', 'The track mp3 url', { post_build: is.func(), }),
    genre: utils.check('string', 'The track genre', { build: is.func(), }),
    ratings: utils.check('array', 'An array of ratings', { build: is.func(), }),
  },
});
