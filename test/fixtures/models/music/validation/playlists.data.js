var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^playlist_[a-z0-9-]+$/),
  type: 'playlist',
  id: is.string().uuid(),
  created: is.date().iso(),
  updated: is.date().iso(),
  visibility: [ 'PUBLIC', 'PRIVATE' ],
  owner: {
    firstName: is.string(),
    lastName: is.string(),
    created: is.date(),
    updated: is.date(),
    picture: {
      large: is.string().uri(),
      thumbnail: is.string().uri(),
      medium: is.string().uri(),
    },
    username: is.string(),
  },
  tracks: is.array()
    .items(is.string().regex(/^[A-Z0-9]+$/))
    .min(1)
    .max(6) // is normally 25 but since there can only be 6 other tracks in testing there should only ever be a max of 6
});
