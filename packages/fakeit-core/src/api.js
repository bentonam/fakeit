// @flow

import { cpus } from 'os'
import findRoot from 'find-root'
import path from 'path'
import fs from 'fs-extra-promisify'
import globby from 'globby'
import { mergeWith } from 'lodash'
import buildDebug from 'debug'
import joi from 'joi'
import { validate } from './utils'
import Config from './config'
import requirePkg from './require-pkg'

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
    output: joi.alternatives()
      .try(joi.func(), joi.string()),
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
  })
  .unknown()

export default class Api {
  settings: Object = {}
  config: Config

  // note that the only real way to pass in arguments here is to pass
  // them in during testing
  constructor (options: Object = {}) {
    this.settings = Object.assign(
      {
        root: process.cwd(),

        // this is the format to output it in.
        // The default is json because it's installed automatically
        format: 'json',

        // the character(s) to use for spacing. default is 2 because it's the most common
        spacing: 2,

        // The type of output to use.
        // This can be a function or string that matches one of the registered output types
        output (): void {},

        // the number of threads to use. The default number of threads is the max amount that
        // your computer has to offer
        threads: max_threads,

        // limit how many files are output at a time, this is useful
        // to not overload a server or lock up your computer
        limit: 50,

        // starts off null and expects an array of the plugins names to use.
        // note this is autofilled, but a user can pass it into the config just incase
        plugins: null,

        // the max time allowed to output files
        timeout: 5000,
      },
      options,
    )

    this.config = new Config(this.settings)

    // this loads all the config files/plugins
    this._loadConfigs()
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
      throw new Error("plugins can't be passed into api.options(), they must be defined in a `fakeitfile.js` or `package.json`")
    }

    Object.assign(this.settings, options)
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
    const fakeitfile = path.relative(__dirname, path.resolve(root, 'fakeitfile.js'))
    try {
      fakeitfile_config = requirePkg(fakeitfile)
    } catch (e) {
      debug(`no config file was found: ${fakeitfile}`)
      // do nothing because we don't care if the file exists or not
    }
    debug('fakeitfile.js config: %O', fakeitfile_config)
    debug('package.json config: %O', user_pkg_config)

    let options = mergeWith(
      {},
      user_pkg_config || {},
      fakeitfile_config,
      (objValue: mixed, srcValue: mixed): mixed[] | void => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue)
        }
      },
    )

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
    options.plugins = dynamic_plugins
      .concat(options.plugins)
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

    // loop over all the plugins to load them and run them
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        // anything plugin that runs in here was defined in the `fakeitfile.js`
        try {
          debug('ran fakeitfile.js plugin init')
          plugin(this.config)
        } catch (e) {
          console.log('error with plugin defined in fakeitfile.js', e)
          throw e
        }
      } else {
        let pluginFn: Function
        // don't know why flow is broken
        try {
          pluginFn = requirePkg(plugin)
          debug(`loaded plugin: ${plugin}`)
          try {
            pluginFn(this.config)
            debug(`ran plugin init: ${plugin}`)
          } catch (e) {
            console.log(`error running plugin ${plugin}`, e)
            throw e
          }
        } catch (e) {
          console.log(`couldn't load ${plugin}`)
        }
      }
    }

    debug('plugins %O', options.plugins)
    delete options.plugins

    this.options(options)

    debug('setup end')
    return this
  }

  // used to run the cli plugin options
  cli (caporal: Object): Api {
    this.config.runCli(caporal)
    return this
  }

  // used to run the model plugins
  plugins (): Api {
    this.config.runPlugins()
    return this
  }
}
