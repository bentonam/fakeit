var utils = require('../../../../utils.js');
var is = require('joi');

module.exports = is.object({
  _id: is.string().regex(/^product_[a-z0-9\-]+$/),
  doc_type: 'product',
  product_id: is.string().uuid(),
  price: is.number().precision(2),
  sale_price: is.number().precision(2),
  display_name: is.string(),
  short_description: is.string().min(50),
  long_description: is.string().min(50 * 5),
  keywords: is.array()
    .items(is.string())
    .sparse(false)
    .min(0)
    .max(10),
  availability: [ 'Preorder', 'In-Stock', 'Out of Stock', 'Discontinued' ],
  availability_date: is.date(),
  product_slug: utils.slug,
  category: is.string().max(25),
  category_slug: utils.slug,
  image: is.string().uri(),
  alternate_images: is.array()
    .items(is.string().uri())
    .sparse(false)
    .min(0)
    .max(4),
  created_on: is.date(),
  modified_on: is.date(),
});
