var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('Chats'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(0).max(0),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(1),
    inputs: is.object().length(0),
    pre_run: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    chat_id: utils.check('string', 'The chat id as a GUID', { build: is.func(), }),
    created_on: utils.check('integer', 'The date of the post', { build: is.func(), }),
    users: utils.check('array', 'An array of user ids who are in the chat', { post_build: is.func(), }),
  }),
});
