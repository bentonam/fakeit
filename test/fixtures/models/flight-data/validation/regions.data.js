var is = require('joi');

module.exports = is.object()
  .pattern(/_id|[a-z][_a-z]+/, is.string().min(3));
