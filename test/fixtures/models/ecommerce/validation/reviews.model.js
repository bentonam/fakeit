var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: 'Reviews',
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: '_id',
  data: is.object({
    min: is.number().min(500).max(500),
    max: is.number().min(1000).max(1000),
    count: is.number().min(500).max(1000),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.object().length(0),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    review_id: utils.check('string', 'Unique identifier representing a specific review', { build: is.func(), }),
    product_id: utils.check('string', 'The product_id the review is for', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id of the user who wrote the review', { build: is.func(), }),
    reviewer_name: utils.check('string', 'The name of the reviewer', { fake: is.string(), }),
    reviewer_email: utils.check('string', 'The reviewers email address', { fake: is.string(), }),
    rating: utils.check('integer', 'The review rating', { build: is.func(), }),
    review_title: utils.check('string', 'The review title', { fake: is.string(), }),
    review_body: utils.check('string', 'The review content', { fake: is.string(), }),
    review_date: utils.check('integer', 'The review content', { fake: is.string(), post_build: is.func(), }),
  }),
});
