var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^product_[a-z0-9\-]+$/),
  doc_type: 'product',
  product_id: is.string().uuid(),
  price: is.number().precision(2),
  sale_price: [ is.number().precision(2), null ],
  display_name: is.string(),
  short_description: is.string(),
  long_description: is.string(),
  keywords: is.array()
    .items(is.string())
    .sparse(false)
    .min(2)
    .max(8),
  availability: [ 'Preorder', 'In-Stock', 'Out of Stock', 'Discontinued' ],
  availability_date: is.date(),
  product_slug: utils.slug,
  category: is.string(),
  category_slug: utils.slug,
  image: is.string().uri(),
  created_on: is.date(),
  modified_on: is.date(),
});
