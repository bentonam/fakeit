var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^runway_[0-9]+$/),
  runway_id: is.number(),
  doc_type: 'runway',
  airport_id: is.number(),
  airport_ident: is.string().uppercase(),
  runway_length: [ is.number(), null ],
  runway_width: [ is.number(), null ],
  surface: [ is.string().uppercase(), null ],
  lighted: is.boolean(),
  closed: is.boolean(),
  low_bearing: {
    ident: [ is.string().uppercase(), null ],
    latitude: [ is.number().precision(10), null ],
    longitude: [ is.number().precision(10), null ],
    elevation: [ is.number(), null ],
    magnetic_heading: [ is.number(), null ],
    displaced_threshold: [ is.number(), null ],
  },
  high_bearing: {
    ident: [ is.string().uppercase(), null ],
    latitude: [ is.number().precision(10), null ],
    longitude: [ is.number().precision(10), null ],
    elevation: [ is.number(), null ],
    magnetic_heading: [ is.number(), null ],
    displaced_threshold: [ is.number(), null ],
  },
});
