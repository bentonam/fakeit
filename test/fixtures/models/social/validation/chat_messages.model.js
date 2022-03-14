const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  name: 'ChatMessages',
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
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.array().items(is.string()).length(0),
    pre_run: is.func(),
    pre_build: is.func(),
  },
  properties: {
    _id: utils.check('string', 'The document id', { post_build: is.func() }),
    doc_type: utils.check('string', 'The document type', { value: is.string() }),
    message_id: utils.check('string', 'The message id as a GUID', { build: is.func() }),
    chat_id: utils.check('string', 'The message id as a GUID', { build: is.func() }),
    user_id: utils.check('integer', 'The user_id that sent the message', { build: is.func() }),
    message_date: utils.check('integer', 'The date of the post', { build: is.func() }),
    message: utils.check('string', 'The message content', { build: is.func() }),
  },
});
