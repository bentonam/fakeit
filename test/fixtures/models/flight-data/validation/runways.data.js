var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^runway_[0-9]+$/),
  runway_id: is.number(),
  doc_type: 'runway',
  airport_id: is.number(),
  airport_ident: is.string().uppercase(),
  runway_length: [ is.number(), is.allow(null) ],
  runway_width: [ is.number(), is.allow(null) ],
  surface: [ is.string().uppercase(), is.allow(null) ],
  lighted: is.boolean(),
  closed: is.boolean(),
  low_bearing: is.object({
    ident: [ is.string().uppercase(), is.allow(null) ],
    latitude: [ is.number().precision(10), is.allow(null) ],
    longitude: [ is.number().precision(10), is.allow(null) ],
    elevation: [ is.number(), is.allow(null) ],
    magnetic_heading: [ is.number(), is.allow(null) ],
    displaced_threshold: [ is.number(), is.allow(null) ],
  }),
  high_bearing: is.object({
    ident: [ is.string().uppercase(), is.allow(null) ],
    latitude: [ is.number().precision(10), is.allow(null) ],
    longitude: [ is.number().precision(10), is.allow(null) ],
    elevation: [ is.number(), is.allow(null) ],
    magnetic_heading: [ is.number(), is.allow(null) ],
    displaced_threshold: [ is.number(), is.allow(null) ],
  }),
});
