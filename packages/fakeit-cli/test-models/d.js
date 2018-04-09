const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'd',
    count: 1,
    key: 'foo',
  })
  .object({
    foo: '',
    bar: '',
  })
