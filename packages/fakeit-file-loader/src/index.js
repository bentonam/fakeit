// @flow

////
/// @name Input
/// @page fakeit-file-loader
/// @description Worker to manage input tasks
////

import relieve from 'relieve'
import { cpus } from 'os'
import { sep } from 'path'
import buildDebug from 'debug'

const debug = buildDebug('@fakeit/file-loader')

const { ScriptTask } = relieve.tasks
const { QueueWorker } = relieve.workers

/// @name FileLoader
/// @description Handles loading files
/// @type {class}
export default class FileLoader extends QueueWorker {
  formats: Object
  data: Object
  ///# @name constructor
  ///# @arg {number} threads - The maximum number of threads to use when loading files
  constructor (formats: Object, threads: number = cpus().length - 1) {
    debug(`{constructor} - starting worker with ${Object.keys(formats)
      .join(', ')} formats, and ${threads} threads`)

    // use the number of threads to set the concurrency setting, when the QueueWorker is
    // ran it will only allow that many tasks to run at a time
    super({ concurrency: threads })

    this.formats = formats
    this.data = {} // variable to hold rendered data sent from the tasks
  }

  ///# @name loadFiles
  ///# @description sets the current documents source value
  ///# @arg {array} files - An array of files to load
  ///# @async
  async loadFiles (files: Array<string>): Promise<Object> {
    debug('loadFiles()')
    debug('%O', files)
    // loop over all of the added files
    for (const file of files) {
      // add a task for each of the files
      const task = new ScriptTask(`${__dirname}/parser.js`)
      // give the task a name by using just the name of the file
      task.name = file.split(sep)
        .pop()
      task.arguments = [ file ] // pass file as an argument to the task
      // attach an event to the task so that we can push the received data onto the Worker instance
      task.once('data', (result: Object) => {
        this.data[result.name] = result.value
      })
      // handle parsing errors from tasks
      task.once('error', (err: Error) => {
        debug('%O', err)
        throw err
      })
      this.add(task) // add the task to the worker
    }
    // call the run method of QueueWorker, this will resolve once all tasks
    // have completed and exited
    debug('starting input processing')
    await this.run()
      .then(() => {
        debug('finished input processing')
        // remove each of the tasks from the worker
        for (const task of this.tasks) {
          this.remove(task.name)
        }
      })
    return this.data
  }
}
