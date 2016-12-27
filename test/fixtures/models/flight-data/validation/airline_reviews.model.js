var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  name: utils.string('AirlineReviews'),
  type: utils.types.object,
  file: is.string(),
  root: is.string(),
  is_dependency: is.boolean(),
  key: utils.string('_id'),
  data: is.object({
    min: is.number().min(0).max(0),
    max: is.number().min(0).max(0),
    count: is.number().min(1).max(1),
    dependencies: is.array().items(is.string()).length(2),
    inputs: is.object().length(0),
    pre_run: is.func(),
    pre_build: is.func(),
  }),
  properties: is.object({
    _id: utils.check('string', 'The document id', { post_build: is.func(), }),
    doc_type: utils.check('string', 'The document type', { value: is.string(), }),
    review_id: utils.check('string', 'Unique identifier representing a specific review', { build: is.func(), }),
    airline_id: utils.check('integer', 'The airline_id the review is for', { build: is.func(), }),
    airline_code: utils.check('string', 'The airport_code the review is for', { build: is.func(), }),
    user_id: utils.check('integer', 'The user_id of the user who wrote the review', { build: is.func(), }),
    rating: utils.check('integer', 'The review rating', { build: is.func(), }),
    review_title: utils.check('string', 'The review title', { fake: is.string(), }),
    review_body: utils.check('string', 'The review content', { fake: is.string(), }),
    review_date: utils.check('integer', 'The review content', { fake: is.string(), post_build: is.func(), }),
  }),
});
