const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'e',
    count: 1,
    key: 'foo',
  })
  .object({
    foo: '',
    bar: '',
  })
