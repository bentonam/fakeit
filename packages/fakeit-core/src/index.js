// @flow
import Input from './input'

const debug = require('debug')('fakeit/core')

export { plugins, version } from './../package.json'

// this is just simulating loading of files from the core, nothing is actually loading
// we're just setting up the structure
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
const input = new Input()

// run the input
input
  .run()
  .then(() => {
    debug('Input is ready')
  })
  .then((): Object => input.loadFiles(input_files)) // send all of the files to the parser
  .then((results: Object) => {
    debug('Loaded Files')
    debug(results)
  })
