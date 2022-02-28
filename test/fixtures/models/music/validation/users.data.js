const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  _id: is.string().regex(/user_.+/),
  type: 'userprofile',
  username: is.string(),
  title: is.string(),
  firstName: is.string(),
  lastName: is.string(),
  gender: ['male', 'female'],
  email: is.string().email(),
  pwd: is.string(),
  address: {
    state: is.string(),
    city: is.string(),
    country_code: is.string().regex(/^[A-Z]{2}$/),
    street: is.string(),
    postal_code: utils.postal_code,
  },
  phones: is.array()
    .items({
      type: ['home', 'work', 'mobile', 'other', 'main'],
      verified: is.date(),
      number: utils.phone,
    })
    .min(0)
    .max(4),
  favoriteGenres: is.array()
    .items(is.string())
    .min(3)
    .max(18),
  dateOfBirth: is.date(),
  status: ['active', 'inactive'],
  created: is.date().iso(),
  updated: is.date().iso(),
  picture: {
    large: is.string().uri(),
    thumbnail: is.string().uri(),
    medium: is.string().uri(),
  },
});
