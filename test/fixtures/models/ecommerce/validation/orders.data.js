const is = require('joi');
const utils = require('../../../../utils.js');

module.exports = is.object({
  _id: is.string().regex(/^order_[0-9]+$/),
  doc_type: 'order',
  order_id: 1,
  user_id: is.number(),
  order_date: is.date(),
  order_status: ['Pending', 'Processing', 'Cancelled', 'Shipped'],
  billing_name: is.string(),
  billing_phone: utils.phone,
  billing_email: is.string().email(),
  billing_address_1: is.string(),
  billing_address_2: [is.string(), null],
  billing_locality: is.string(),
  billing_region: is.string(),
  billing_postal_code: is.string(),
  billing_country: 'US',
  shipping_name: is.string(),
  shipping_address_1: is.string(),
  shipping_address_2: [is.string(), null],
  shipping_locality: is.string(),
  shipping_region: is.string().uppercase().length(2),
  shipping_postal_code: utils.postal_code,
  shipping_country: 'US',
  shipping_method: is.string(),
  shipping_total: is.number().precision(2),
  tax: is.number().precision(2).min(2.00).max(10.99),
  line_items: is.array()
    .items({
      product_id: is.string().uuid(),
      display_name: is.string(),
      short_description: is.string().min(50),
      image: is.string().uri(),
      price: is.number().precision(2),
      qty: is.number().min(1).max(5),
      sub_total: is.number(),
    })
    .min(1)
    .max(5)
    .sparse(false),
  grand_total: is.number().precision(2),
});
