// @flow
import InputWorker from './input'

const debug = require('debug')('fakeit/core:input:worker')

export { plugins, version } from './../package.json'

const input_files = [
  'some/directory/file1.json',
  'some/directory/file2.js',
  'some/directory/file3.csv',
  'some/directory/file4.zip',
  'some/directory/file5.cson',
  'some/directory/file6.json',
  'some/directory/file7.js',
  'some/directory/file8.csv',
  'some/directory/file9.zip',
  'some/directory/file10.cson',
]
const input = new InputWorker()

// run the input
input.run()
  .then(() => {
    debug('InputWorker is ready')
    // send all of the files to the parser
    input.parseFiles(input_files)
      .then((results: Object) => {
        debug(results)
      })
  })
