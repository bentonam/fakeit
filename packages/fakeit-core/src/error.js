// @flow

import callsiteRecord from 'callsite-record'
import { wrapCallSite } from 'source-map-support'
import buildDebug from 'debug'
import { natives } from 'stack-utils-node-internals'
import { homedir } from 'os'

const internals = natives.map((native: string) => native.replace(/\//g, '.'))
const filter_regex = new RegExp(`\\bbabel[a-z./]*\\b|^(${internals.join('|')})\\.js$`)

const home = new RegExp(homedir(), 'g')

const debug = buildDebug('@fakeit')

function processFrameFn (frame: Object): Object {
  // fixes a weird bug with `wrapCallSite`
  frame.isNative = () => false

  let file = frame.getFileName()

  frame = wrapCallSite(frame)
  if (file.includes('fakeit')) {
    file = file.replace('dist', 'src')
      .replace(/jsx$/, 'js')
    frame.getFileName = () => file
    frame.getScriptNameOrSourceURL = () => file
  }

  return frame
}

/* eslint-disable no-sync */
export default class FakeitError extends Error {
  _stack: string
  constructor (reason: string | Error, options: Object = {}) {
    super(reason)

    // this removes `FakeitError` from the stack trace :thumbsup:
    Error.captureStackTrace(this, FakeitError)

    if (options.self) {
      Error.captureStackTrace(this, options.self)
    }

    this.message = this.message.replace(/^Error:\s/, '')

    // disable the awesome stack trace
    if (!debug.enabled) {
      try {
        let stack = callsiteRecord({
          forError: this,
          processFrameFn,
        })
          .renderSync({
            stackFilter (frame: Object): boolean {
              const filter = !filter_regex.test(frame.getFileName())

              if (options.filter) {
                return options.filter(frame) && filter
              }

              return filter
            },
          })
        stack = stack
          // updates the default renderer to replace the home dir with `~`
          .replace(home, '~')
          // add a space between the `|` and the code because it looks better
          .replace(/^((?:\u001b\[41m >)?(?:\s+[0-9]+\s*)(?:\u001b\[49m)?\|)/gm, '$1 ')
        // store the original stack
        this._stack = this.stack
        this.stack = `   ${this.message}\n\n${stack}\n\n`
      } catch (e) {
        // do nothing because this is just an added bonus but
        // it's not necessary to make the app run
        const _debug = buildDebug('@fakeit/core:error')
        _debug(e)
      }
    }
  }
}
