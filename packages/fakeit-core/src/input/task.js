// @flow

////
/// @name Input
/// @page fakeit-core/input
/// @description Worker task that handles parsing any available input
////
import path from 'path'

const debug = require('debug')(`fakeit/core:input:task[${process.pid}]`)

// The line below is disabled for flow because it can't detect that relieve is attached to process
// $FlowFixMe
const channel = process.relieve.ipc

/// @name process
/// @description Handles parsing of a passed file, this will be called from the
///              Worker as worket.get('parse', path_to_file), the Worker handles
///              wraps the call in a Promise
/// @returns {Promise} - Contents of parsed file
export function parse (full_path: string): Promise<Object> {
  debug('parse()')
  const info = path.parse(full_path)
  debug('%O', info)
  // simulating parsing a file
  // *Note: this is where we'll need a function to determine which formatter to use
  // based on the file extension or lastly try something like require(`@fakeit/format-${ext}`)
  const timer = Math.floor(Math.random() * 3000) + 250 // use a random number
  return new Promise((resolve: (value: Object) => void) => {
    // simulating parsing a file
    // *Note: this is where we'll need a function to determine which formatter to use
    // based on the file extension or lastly try something like require(`@fakeit/format-${ext}`)
    setTimeout(() => {
      resolve({
        name: info.name,
        value: {},
      })
    }, timer)
  })
}

/// @name start
/// @description Called when the task is started by the Worker
/// @returns {array} - With the paths that have been matched
export function start () {
  debug('start()')
  // simulating parsing a file
  // *Note: this is where we'll need a function to determine which formatter to use
  // based on the file extension or lastly try something like require(`@fakeit/format-${ext}`)
  parse(process.argv[3].replace(/^"|"$/i, ''))
    .then((result: mixed) => {
    // send the resulting data back up to the worker
      channel.send('data', result)
      // exit the task so the worker knows that we're finished
      process.exit(0)
    })
}
