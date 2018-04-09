const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'a',
    count: 1,
    key: 'foo',
    inputs: [ { input: 'something.csv', sample: 10.12334 } ],
    dependencies: [ { model: './b.js', sample: 10.1234 } ],
  })
  .object({
    foo: '',
    bar: '',
  })
