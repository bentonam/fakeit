const is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/track_[A-Z0-9]+/).length(46),
  type: 'track',
  id: is.string().regex(/[A-Z0-9]+/).length(40),
  created: is.date().iso(),
  updated: is.date().iso(),
  artist: is.string(),
  title: is.string(),
  mp3: is.string().uri().regex(/.*\/(?:files|audio|mp3|downloads)\/.+\.mp3$/),
  genre: is.string().regex(/^[\–\-a-zA-Z\/'&\s28:,éí]+$/).min(3).max(39),
  ratings: is.array()
    .items({
      created: is.date().iso(),
      rating: is.number().min(0).max(5),
      username: is.string(),
    })
    .min(0)
    .max(12)
    .sparse(false),
});
