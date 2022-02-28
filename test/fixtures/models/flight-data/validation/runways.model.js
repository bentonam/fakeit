const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  name: 'Runways',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  dependants: is.array(),
  key: '_id',
  seed: 0,
  data: {
    min: 0,
    max: 0,
    count: 1,
    dependencies: is.array().items(is.string()).length(0),
    inputs: is.array().items(is.string()).length(1),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    runway_id: utils.check('integer', 'The runway id', { build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    airport_id: utils.check('integer', 'The id of the airport the runway belongs to', { build: is.func() }),
    airport_ident: utils.check('string', 'The airport identifier', { build: is.func() }),
    runway_length: utils.check('integer', 'The length of the runway in feet', { build: is.func() }),
    runway_width: utils.check('integer', 'The width of the runway in ft', { build: is.func() }),
    surface: utils.check('string', 'The runway surface', { build: is.func() }),
    lighted: utils.check('boolean', 'Whether or not the runway is lighted', { build: is.func() }),
    closed: utils.check('boolean', 'Whether or not the runway is closed', { build: is.func() }),
    low_bearing: {
      data: is.object().length(0),
      type: 'object',
      properties: {
        ident: utils.check('string', 'The low bearing runway identifer (1 - 18)', { build: is.func() }),
        latitude: utils.check('float', 'The low bearing runway latitude', { build: is.func() }),
        longitude: utils.check('float', 'The low bearing runway longitude', { build: is.func() }),
        elevation: utils.check('integer', 'The low bearing runway elevation', { build: is.func() }),
        magnetic_heading: utils.check('integer', 'The low bearing true magnetic heading', { build: is.func() }),
        displaced_threshold: utils.check('integer', 'The low bearing displacement from the end of the runway to the threshold', { build: is.func(), }), // eslint-disable-line
      },
    },
    high_bearing: {
      data: is.object().length(0),
      type: 'object',
      properties: {
        ident: utils.check('string', 'The high bearing runway identifer (19 - 36)', { build: is.func() }),
        latitude: utils.check('float', 'The high bearing runway latitude', { build: is.func() }),
        longitude: utils.check('float', 'The high bearing runway longitude', { build: is.func() }),
        elevation: utils.check('integer', 'The high bearing runway elevation', { build: is.func() }),
        magnetic_heading: utils.check('integer', 'The high bearing true magnetic heading', { build: is.func() }),
        displaced_threshold: utils.check('integer', 'The high bearing displacement from the end of the runway to the threshold', { build: is.func(), }), // eslint-disable-line
      },
    },
  },
});
