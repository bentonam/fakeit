// this is exported here as well as index.js so that someone can import
// it through `import FakeitError from '@fakeit/core/error'` or
// `import { FakeitError } from '@fakeit/core'`
module.exports = require('./dist/error.js').default
