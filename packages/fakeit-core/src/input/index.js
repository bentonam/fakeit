// @flow

////
/// @name Input
/// @page fakeit-core/input
/// @description Worker to manage input tasks
////

import relieve from 'relieve'
import { cpus } from 'os'
import { sep } from 'path'

const debug = require('debug')('fakeit/core:input:worker')

const { ScriptTask } = relieve.tasks
const { QueueWorker } = relieve.workers

export default class InputWorker extends QueueWorker {
  ///# @name constructor
  constructor (threads: number = cpus().length - 1) {
    debug(`{constructor} - starting worker with ${threads} threads`)
    // use the number of threads to set the concurrency setting, when the QueueWorker is
    // ran it will only allow that many tasks to run at a time
    super({ concurrency: threads })
    this.data = {} // variable to hold rendered data sent from the tasks
  }

  async parseFiles (files: Array<string>): Promise<Object> {
    debug('parseFiles()')
    debug('%O', files)
    // loop over all of the added files
    for (const file of files) {
      // add a task for each of the files
      const task = new ScriptTask(`${__dirname}/task.js`)
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
