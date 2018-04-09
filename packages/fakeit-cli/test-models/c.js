const fakeit = require('@fakeit/core')

module.exports = fakeit
  .options({
    name: 'c',
    count: 1,
    key: 'foo',
    dependencies: [ './a.js', './j.js' ],
  })
  .object({
    foo: '',
    bar: '',
  })
