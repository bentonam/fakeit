var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Likes',
  type: 'object',
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: {
    min: is.number().min(0).max(0),
    max: is.number().min(1).max(1),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.object().length(0),
    pre_run: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    like_id: utils.check('string', 'The post id as a GUID', { build: is.func(), }),
    post_id: utils.check('string', 'The post id as a GUID', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id that liked the post', { build: is.func(), }),
    like_date: utils.check('integer', 'The date of the like', { build: is.func(), }),
  },
});
