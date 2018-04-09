const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'b',
    count: 1,
    key: 'foo',
  })
  .object({
    foo: '',
    bar: '',
  })
