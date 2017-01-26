var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Playlists',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  seed: 0,
  data: {
    min: 500,
    max: 1000,
    count: is.number().min(500).max(1000),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.array().items(is.string()).length(0),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    type: utils.check('string', 'The document type', { value: is.string(), }),
    id: utils.check('string', 'Unique identifier representing a specific playlist', { build: is.func(), }),
    created: utils.check('string', 'The date the track was created', { fake: is.string(), post_build: is.func(), }),
    updated: utils.check('string', 'The date the track was updated', { fake: is.string(), post_build: is.func(), }),
    visibility: utils.check('string', 'The playlist visibility', { build: is.func(), }),
    owner: utils.check('object', 'The user that the playlist belongs to', { build: is.func(), }),
    tracks: {
      type: 'array',
      description: 'An array of track id\'s',
      items: {
        type: 'string',
        data: {
          min: 3,
          max: 25,
          count: 0,
          build: is.func(),
        },
      },
    },
  },
});
