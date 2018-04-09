const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'h',
    count: 1,
    key: 'foo',
  })
  .object({
    foo: '',
    bar: '',
  })
