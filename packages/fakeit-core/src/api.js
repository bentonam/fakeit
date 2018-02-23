// @flow

import { cpus } from 'os'
import findRoot from 'find-root'
import path from 'path'
import fs from 'fs-extra-promisify'
import globby from 'globby'
import { mergeWith, noop, isEmpty } from 'lodash'
import buildDebug from 'debug'
import joi from 'joi'
import EventEmitter from 'events'
import autoBind from 'auto-bind'
// import CallableTask from 'relieve/tasks/CallableTask'
import { validate } from './utils'
import Config from './config'
import requirePkg from './require-pkg'
import FakeitError from './error'
// import RunStatus from './run-status'

function merge (...args: Object[]): Object {
  return mergeWith(...args, (objValue: mixed, srcValue: mixed): mixed[] | void => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

const debug = buildDebug('@fakeit/core:api')
const max_threads = cpus().length - 1
const options_schema = joi
  .object({
    root: joi.string()
      .trim(),
    format: joi
      .string()
      .trim()
      .regex(/^[a-z]{2,6}$/),
    spacing: joi.alternatives()
      .try(
        joi
          .number()
          .min(0)
          .max(4),
        joi
          .string()
          .min(0)
          .max(4),
      ),
    count: joi.alternatives()
      .try(null, joi.number()
        .min(1)),
    output: joi.alternatives()
      .try(joi.func(), joi.string()),
    models: joi.array()
      .items(joi.string()),
    threads: joi
      .number()
      .min(1)
      .max(max_threads),
    limit: joi
      .number()
      .min(1)
      .max(1000),
    plugins: joi
      .alternatives()
      .try(
        null,
        joi.string(),
        joi.func(),
        joi.array()
          .items(joi.alternatives()
            .try(null, joi.string(), joi.func())),
      ),
    timeout: joi.number()
      .min(1000),
    seed: joi.alternatives()
      .try(null, joi.number(), joi.string()),
  })
  .unknown()

export default class Api extends EventEmitter {
  settings: Object = {}
  config: Config

  // note that the only real way to pass in arguments here is to pass
  // them in during testing
  constructor (options: Object) {
    super()
    this.settings = Object.assign(
      {
        root: process.cwd(),

        // this is the format to output it in.
        // The default is json because it's installed automatically
        format: 'json',

        // Sets a global count that's used instead of the count defined on the model.
        // If this is set then it will also override anything that's dynamically set via
        // `fakeit.before(() => ...)` on a model level
        count: null,

        // the character(s) to use for spacing. default is 2 because it's the most common
        spacing: 2,

        // The type of output to use.
        // This can be a function or string that matches one of the registered output types
        output: noop,

        // the models to be output
        models: [],

        // the number of threads to use. The default number of threads is the max amount that
        // your computer has to offer
        threads: max_threads,

        // limit how many files are output at a time, this is useful
        // to not overload a server or lock up your computer
        limit: 50,

        // note this is autofilled, but a user can pass it into the config just incase
        plugins: [],

        // the max time allowed to output files
        timeout: 5000,

        // The global seed to use for repeatable data
        seed: null,

        // fail after the first error
        fail_fast: true,
      },
      /* istanbul ignore next : to hard to test, also no reason to test for it */
      options || {},
    )

    this.config = new Config(this.settings)

    // this loads all the config files/plugins
    this._loadConfigs()

    // auto binds methods to it's instance
    autoBind(this)
  }

  /// @name options
  /// @description This function allows you to pass in additional options into the api
  /// after it has been instantiated. For example this is used with the @fakeit/cli
  /// @arg {object} options - The options you're wanting to add to the config
  /// @markup Example:
  /// const api = new Api()
  /// api.options({
  ///   format: 'csv',
  /// })
  /// @chainable
  /// @note The only thing you can't add as an option after is a plugin.
  /// That must be passed into the constructor or config files
  options (options: Object = {}): Api {
    options = validate(options, options_schema)

    if (options.plugins) {
      throw new FakeitError("plugins can't be passed into api.options(), they must be defined in a `fakeitfile.js` or `package.json`")
    }

    merge(this.settings, options)
    this.config.runOptions()
    return this
  }

  /// @name _loadConfigs
  /// @description This will load any configurations declared in `fakeitfile.js`, `package.json`
  /// It will also auto import plugins
  /// @access private
  /// @chainable
  _loadConfigs (): Api {
    // sync is used here so that the api isn't
    // weird `new Api().setup().then(() => )` would be weird af
    /* eslint-disable no-sync */
    debug('setup start')
    const root = findRoot(this.settings.root)
    const {
      fakeit: user_pkg_config,
      dependencies = {},
      peerDependencies = {},
      devDependencies = {},
    } = fs.readJsonSync(path.join(root, 'package.json'))
    let fakeitfile_config: Object = {}
    const fakeitfile = './fakeitfile.js'
    try {
      fakeitfile_config = requirePkg(fakeitfile, root)
    } catch (e) {
      debug(`no config file was found: ${fakeitfile}`)
      // do nothing because we don't care if the file exists or not
    }
    debug('fakeitfile.js config: %O', fakeitfile_config)
    debug('package.json config: %O', user_pkg_config)

    let options = merge({}, user_pkg_config || {}, fakeitfile_config)

    options = validate(options, options_schema)

    // dynamically get the plugins based of the users `package.json`
    // and by looking in the `node_modules` folder
    const dynamic_plugins = []
      .concat(
        Object.keys(Object.assign(dependencies, peerDependencies, devDependencies)),
        globby.sync(path.join('@fakeit/*'), { cwd: path.join(root, 'node_modules'), nodir: false }),
      )
      // filter out any packages that don't match @fakeit/format* or @fakeit/plugin*
      .filter((pkg: string) => pkg && /@fakeit\/(format|plugin).*/.test(pkg))
    debug('dynamic_plugins: %O', dynamic_plugins)
    options.plugins = dynamic_plugins
      .concat(this.settings.plugins, options.plugins)
      // filter out any duplicate strings. This can't use `_.uniq` otherwise it would filter out
      // annonymous functions that could be defined in the `fakeitfile.js`
      .filter((item: string | Function, i, array) => {
        // functions can be defined in fakeitfile.js
        if (typeof item === 'function') {
          return true
        }
        // ensure there's not another item in the array with the same value
        // that comes after the current index
        return item && !array.includes(item, i + 1)
      })
    this.settings.plugins = options.plugins

    // loop over all the plugins to load them and run them
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        // anything that runs in here was defined in the users `fakeitfile.js`
        try {
          plugin(this.config)
          debug('ran fakeitfile.js plugin init')
        } catch (e) {
          e.message = `error with plugin defined in fakeitfile.js. ${e.message}`
          throw new FakeitError(e)
        }
      } else {
        // anything that runs in here was imported either dynamically or by specifying a string
        let pluginFn: Function | void

        try {
          pluginFn = requirePkg(plugin, root)
          debug(`loaded plugin: ${plugin}`)
        } catch (e) {
          debug(`couldn't load ${plugin}`)
        }

        // if it was loaded
        if (pluginFn) {
          try {
            pluginFn(this.config)
            debug(`ran plugin init: ${plugin}`)
          } catch (e) {
            e.message = `error running plugin ${plugin}. ${e.message}`
            throw new FakeitError(e)
          }
        }
      }
    }

    debug('plugins %O', options.plugins)
    delete options.plugins

    this.options(options)

    debug('setup end')
    return this
  }

  _resolveFiles (globs: string | string[]): Promise<string> {
    if (isEmpty(globs)) {
      globs = this.settings.models
    }
    globs = globs.map((glob: string) => path.resolve(this.settings.root, glob))
    return globby(globs, {
      cwd: this.settings.root,
    })
  }

  // run everything
  async run (models: string | string[]): Promise<void> {
    models = await this._resolveFiles(models)

    if (!models.length) {
      throw new FakeitError('you must pass in models to run')
    }

    const pkg = requirePkg(models[0])
    // console.log('models:', models)
    // console.log('models:', )

    console.log(pkg.model.settings.dependencies)
    process.exit(0)

    // // holds the pending forks
    // const pending_forks = new Set()
    // let bailed = false
    //
    // const status = new RunStatus({
    //   fail_fast: this.settings.fail_fast,
    //   model_count: models.length,
    // })
    //
    // if (this.settings.fail_fast) {
    //   // Prevent new test files from running once a test has failed.
    //   status.on('document', (document: Object) => {
    //     if (document.error) {
    //       bailed = true
    //
    //       for (const fork of pending_forks) {
    //         fork.notifyOfPeerFailure()
    //       }
    //     }
    //   })
    // }
    //
    // this.emit('models-run', status, models)
    //
    // console.log(models)

    // const task = new CallableTask(`${__dirname}/task.js`, { restart: true })
    // // bluebird specific
    // return Promise.map(files, (file) => {
    //   console.log(file);
    // })

    /* eslint-disable no-unreachable */

    // !!!!!!
    // !!!!!!
    // !!!!!!
    // !!!!!! currently this function is fake and just used to demo the cli
    // !!!!!!
    // !!!!!!
    // !!!!!!

    // // eslint-disable-next-line
    // const _ = require('lodash')
    // const random = _.random
    // const clamp = _.clamp
    // const createModel = (name: string) => {
    //   const model = {
    //     name,
    //     count: 0,
    //     total: random(500, 2000),
    //     output: 0,
    //     is_dependency: Boolean(random(0, 1)),
    //     _should_error: random(0, 4) === 0,
    //     error: false,
    //   }
    //   this.emit('model-start', model)
    //   return model
    // }
    // const _models = [
    //   'one',
    //   'two',
    //   'three',
    //   'four',
    //   'five',
    // ].map(createModel)
    //
    // const interval = setInterval(() => {
    //   const index = random(0, _models.length - 1)
    //   const model = _models[index]
    //   if (!model) {
    //     clearInterval(interval)
    //     this.emit('finished')
    //     return
    //   }
    //
    //   if (!model.is_dependency) {
    //     model.output = clamp(model.output + random(1, 10), 0, model.count)
    //   }
    //
    //   if (model._should_error && random(0, 100) < 3) {
    //     model.error = true
    //   }
    //
    //   if (typeof model.error === 'number') {
    //     model.error += random(1, 25)
    //   }
    //
    //   model.count = clamp(model.count + random(1, 25), model.total)
    //
    //   if ((model.output || model.count) === model.total || model.error) {
    //     _models.splice(index, 1)
    //   }
    //
    //   this.emit('document-update', model)
    // }, 10)
  }

  ///# @name runCli
  ///# @description
  ///# This is used to run the cli plugin commands that will add different commands to the cli
  ///# @arg {caporal} caporal - The Caporal.js instance
  ///# @arg {function} next - The function that should be called to initiate the document generation
  ///# @async
  runCli (caporal: Object, next: Function): Promise<void> {
    return this.config.runCli(caporal, next)
  }

  ///# @name runPlugins
  ///# @description
  ///# This function is used to run the plugins for the models
  runPlugins (): Api {
    this.config.runPlugins()
    return this
  }
}
