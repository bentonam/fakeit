var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Playlists'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(500).max(500),
    max: is.number().min(1000).max(1000),
    count: is.number().min(500).max(1000),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.object().length(0),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    type: utils.check('string', 'The document type', { value: is.string(), }),
    id: utils.check('string', 'Unique identifier representing a specific playlist', { build: is.func(), }),
    created: utils.check('string', 'The date the track was created', { fake: is.string(), post_build: is.func(), }),
    updated: utils.check('string', 'The date the track was updated', { fake: is.string(), post_build: is.func(), }),
    visibility: utils.check('string', 'The playlist visibility', { build: is.func(), }),
    owner: utils.check('object', 'The user that the playlist belongs to', { build: is.func(), }),
    tracks: is.object({
      type: utils.types.array,
      description: utils.string('An array of track id\'s'),
      items: is.object({
        type: utils.types.string,
        data: is.object({
          min: is.number().min(3).max(3),
          max: is.number().min(25).max(25),
          count: is.number().min(3).max(25),
          build: is.func(),
        }),
      }),
    }),
  }),
});
