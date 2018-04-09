// @flow

import EventEmitter from 'events'

// base setup to hold all run stats in one place
export default class RunStats extends EventEmitter {
  settings: Object
  model_count: number
  models: Object[]
  remaining_model_count: number
  errors: Object[]
  fail_count: number
  rejection_count: number
  exception_count: number
  observation_count: number
  observation_count: number

  constructor (options: Object = {}) {
    super()

    this.settings = Object.assign(
      {
        model_count: 0,
        fail_fast: true,
      },
      options,
    )
    // model count total

    // the models being run
    this.models = []
    // remaining models run
    this.remaining_model_count = this.settings.model_count || 0
    // holds any errors
    this.errors = []
    // the total number of documents that failed to be created
    this.fail_count = 0
    // total number of unhandled rejections
    this.rejection_count = 0
    // total number of uncaught exceptions
    this.exception_count = 0

    this.observation_count = 0
  }

  observeFork (emitter: Object): void {
    this.observation_count++
    emitter
      // .on('teardown', this.handleTeardown)
      // .on('stats', this.handleStats)
      .on('document', this.handleDocument)
      .on('unhandledRejections', this.handleRejections)
      .on('uncaughtException', this.handleExceptions)
      .on('stdout', this.handleOutput.bind(this, 'stdout'))
      .on('stderr', this.handleOutput.bind(this, 'stderr'))
  }

  handleRejections (data: Object): void {
    this.rejection_count += data.rejections.length

    data.rejections.forEach((err) => {
      err.type = 'rejection'
      err.file = data.file
      this.emit('error', err, this)
      this.errors.push(err)
    })
  }

  handleExceptions (data: Object): void {
    this.exception_count++
    const err = data.exception
    err.type = 'exception'
    err.file = data.file
    this.emit('error', err, this)
    this.errors.push(err)
  }

  handleDocument (document: Object): void {
    if (document.error) {
      this.errors.push(document)
    }

    this.emit('document', document, this)
  }

  handleOutput (channel: string, data: Object): void {
    this.emit(channel, data, this)
  }
}
