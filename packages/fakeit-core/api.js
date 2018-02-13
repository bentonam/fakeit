// this is exported here as well as index.js so that someone can import
// it through `import FakeitApi from '@fakeit/core/api'` or `import { Api } from '@fakeit/core'`
module.exports = require('./dist/api.js').default
