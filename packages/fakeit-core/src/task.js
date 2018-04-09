// @flow
import Api from './api'
import requirePkg from './require-pkg'

// workers have to export out named functions in order to use them with relieve
/* eslint-disable import/prefer-default-export */

// The line below is disabled for flow because it can't detect that relieve is attached to process
// $FlowFixMe
const channel = process.relieve.ipc
const api = new Api()
let model
// let count =

export function start (): void {
  const {
    options, file, root, is_dependency, dependencies, inputs, dependants,
  } = JSON.parse(process.argv[3])
  model = requirePkg(file)
  model.root = root
  model.is_dependency = is_dependency
  model.dependencies = dependencies
  model.inputs = inputs
  model.dependants = dependants
  model.send = channel.send.bind(channel)
  // pass in the options that were gathered from the cli
  api.options(options)

  // @remove
  setTimeout(() => process.exit(0), 10000)
}

export function createDocument (): void {
  const document = { woohoo: 'asdfasdsf' }

  // ...code to build out the current document....

  channel.send('document', model.file, document)
}
