// @flow
import buildDebug from 'debug'
import { entries, get, set } from 'lodash'
import joi from 'joi'
import { forEach } from 'async-array-methods'
import { validate } from './utils'
import FakeitError from './error'

const debug = buildDebug('@fakeit/core:config')
/// @name config
/// @page fakeit-core/config
/// @description This function is used to load plugins and their options
/// Each plugin that is loaded from this should be formatted like this
/// ```js
/// // @fakeit/plugin-something
/// import faker from 'faker'
/// export function config(config) {
///   // `config` doesn't have the same functions as the `fakeit-core/models/index.js` does.
///   // I name this `config` because it was shorter than `fakeitConfig`
///
///   // any plugin that is defined will end up being added on to the
///   // model context prefixed with a `$` aka in this case it would
///   // `fakeit.build((t) => t.$faker.name.firstName())` in this case
///   config.plugin('faker', (settings) => {
///     // this function will run 1 time after the rest of the initial setup happens
///     // but before any document generation happens
///     if (settings.seed) {
///       return faker.seed(settings.seed)
///     }
///     return faker
///   })
///
///   // format function requires both parse and stringify functions. They must also be async.
///   config.format('json', {
///     parse(obj) {
///       return Promise.resolve(JSON.parse(obj))
///     },
///     stringify(obj, options) {
///       // `options` is just the configuration that has been passed down
///       const spacing = ((options.format || {}).json || {}).spacing || options.spacing
///       return Promise.resolve(JSON.stringify(obj, null, spacing))
///     },
///   })
///
///   // this function would allow a plugin author to define out their plugin defaults
///   config.options('couchbase', (plugin_options) => {
///     // `plugin_options` would be the result of the defaults
///     // merged with the options passed in the config/cli
///
///     // we could expose the validate function and joi to make it easy to add validation
///     // config.validate(plugin_options, config.joi.object())
///     return Object.assign({
///       server: '127.0.0.1',
///       bucket: 'default',
///       username: '',
///       password: '',
///       timeout: 5000
///     }, plugin_options)
///   })
///
///   config.cli((caporal, next) => {
///     // the cli instance will be passed in so that the different outputs can be added to it
///     caporal
///       .command('couchbase')
///       // ...etc
///       // note that the next function must be passed to the action command in order
///       // for it to kick off correctly.
///       .action(next('ink-test'))
///   })
///
///   // this is here for features like `@fakeit/plugin-yaml-model` so we could support yaml models
///   config.processor('yaml', (contents, filepath, settings) => {
///     // parse the file in it's language
///     // then convert it into the js model format aka (fakeit.build())
///     return model
///   })
///
///   // the output function should be async
///   config.output('couchbase', async (document, settings) => {
///     // `document` will be a single document that is ready to be output
///     // `settings` is just the configuration that has been passed down
///   })
/// }
export default class Config {
  plugins: Object = {}
  $plugins: Object = {}
  formats: Object = {}
  settings: Object = {}
  _cli_plugins: Function[] = []
  _plugin_default_options: Object = {}
  processors: Object = {}
  outputs: Object = {}

  constructor (options: Object = {}) {
    // these settings are just passed down from Api
    this.settings = options
  }

  ///# @name plugin
  ///# @description
  ///# This function allows you to add a model plugin that can be used throughout
  ///# your fake data generation. Any plugin that is defined will end up being added on to the
  ///# model context prefixed with a `$`. For example if you added `config.plugin('faker', ...)`
  ///# in this case it would be available to the model like this
  ///# `fakeit.build((t) => t.$faker.name.firstName())`
  ///# @arg {string} name - The name of the plugin you're adding
  ///# @arg {function} fn - The function that will be run for you to setup your plugin.
  ///# What ever is returned from this function will be used as the plugin in the model.
  ///# This function is passed in `settings` which has all the current settings
  ///# for the current model.
  ///# @note this function will run 1 time after the rest of the initial setup
  ///# happens but before any document generation happens
  ///# @markup Example
  ///# config.plugin('faker', (settings) => {
  ///#   if (settings.$seed) {
  ///#     return faker.seed(settings.$seed)
  ///#   }
  ///#   return faker
  ///# })
  ///# @chainable
  plugin (name: string, fn: Function): Config {
    name = validate(
      name,
      joi.string(),
      `\`config.plugin(name, fn)\` name must be a string you passed in ${name}`,
    )
    fn = validate(
      fn,
      joi.func(),
      // $FlowFixMe
      `\`config.plugin(name, fn)\` name must be a string you passed in ${fn}`,
    )
    debug(`added plugin: ${name}`)
    this.plugins[name] = fn
    return this
  }

  ///# @name runPlugins
  ///# @access private
  ///# @description This is used to run all the plugins and set them up
  ///# @chainable
  runPlugins (): Config {
    for (const name of Object.keys(this.plugins)) {
      this.$plugins[`$${name}`] = this.plugins[name](this.settings)
    }
    return this
  }

  ///# @name format
  ///# @description
  ///# Used to add new formatting methods for different languages.
  ///# What ever language you add you will be able to import that
  ///# file type and output that file type
  ///# @arg {string} ext - The file extension to support
  ///# @arg {object} parse_stringify - The parse and stringify functions
  ///# ```js
  ///# {
  ///#   async parse() {},
  ///#   async stringify() {},
  ///# }
  ///# ```
  ///# @markup Example: adding `yaml` format
  ///# // yaml is imported at the top of the file
  ///#
  ///# config.format('yaml', {
  ///#   parse: (obj) => Promise.resolve(yaml.parse(obj)),
  ///#   stringify (obj, settings) {
  ///#     return Promise.resolve(yaml.stringify(obj, 100, settings.spacing).trim())
  ///#   },
  ///# })
  ///#
  ///# config.format('yml', config.formats.yaml)
  ///#
  ///# @note {10} Every `parse` and `stringify` function must return a promise.
  ///# This is required because some parsers are async.
  ///# @chainable
  format (ext: string, parse_stringify: Object): Config {
    ext = validate(
      ext,
      joi
        .string()
        .min(1)
        .max(6),
      (str: string) => str.replace('value', 'ext'),
    )
    parse_stringify = validate(
      parse_stringify,
      joi.object({ parse: joi.func(), stringify: joi.func() }),
      (str: string) => str.replace('value', 'parse_stringify'),
    )
    debug(`added format: ${ext}`)
    this.formats[ext] = parse_stringify
    return this
  }

  ///# @name joi
  ///# @getter
  ///# @description
  ///# This will just return the [joi](https://github.com/hapijs/joi) object
  ///# for you to use with the validation
  ///# @return {joi} The [joi](https://github.com/hapijs/joi) object
  /* eslint-disable class-methods-use-this */
  /* istanbul ignore next : this is a third party lib */
  get joi (): Object {
    return joi
  }

  ///# @name validate
  ///# @description
  ///# This can be used to validate options. This uses
  ///# [joi](https://github.com/hapijs/joi) behind the scenes
  ///# @arg {*} the item you want to validate against
  ///# @arg {joi} The [joi](https://github.com/hapijs/joi) schema
  ///# @markup
  ///# const joi = config.joi
  ///# const schema = joi.object({
  ///#   foo: joi.string()
  ///# })
  ///# config.validate({ foo: 'somestring' }, schema)
  ///# @chainable
  /* istanbul ignore next : this is tested with the utils */
  validate (obj: mixed, schema: Object): Config {
    return validate(obj, schema)
  }
  /* eslint-enable class-methods-use-this */

  ///# @name options
  ///# @description
  ///# The `options` function allows you to pass in default options,
  ///# and run any validation that you want to run against the options that
  ///# were set.
  ///# @arg {string} key - The name of the options
  ///# @arg {object, function} obj_fn
  ///# The function to run validation against any options that were passed in.
  ///# This validation function is optional. If you do use this function you are required to return
  ///# the options that you want to end up using and those will be set globally
  ///# @markup Example: adding couchbase defaults
  ///# // this function would allow a plugin author to define out their plugin defaults
  ///# config.options('couchbase', (plugin_options) => {
  ///#   ...validation...
  ///#   return Object.assign({
  ///#     server: '127.0.0.1',
  ///#     bucket: 'default',
  ///#     username: '',
  ///#     password: '',
  ///#     timeout: 5000
  ///#   }, plugin_options)
  ///# })
  ///# @chainable
  options (key_path: string, obj_fn: Object | Function): Config {
    key_path = validate(key_path, joi.string(), (str: string) => str.replace('value', 'key_path'))
    obj_fn = validate(obj_fn, joi.alternatives()
      .try(joi.object(), joi.func()), (str: string) => {
      return str
        .split(/\n/)
        .slice(-3)
        .join('\n')
        .replace(/value/g, 'obj_fn')
    })

    debug(`added option defaults: ${key_path}`)
    let fn: Function = obj_fn
    // if a object is passed in then just convert it to a function
    // that does the extending already. This is just a shorthand for
    // a comon use case
    if (typeof obj_fn === 'object') {
      const obj: Object = obj_fn
      fn = (plugin_options: Object) => {
        return Object.assign({}, obj, plugin_options)
      }
    }

    this._plugin_default_options[key_path] = fn
    return this
  }

  ///# @name runOptions
  ///# @description This will run all the options that were set with `config.options(...)`
  ///# @markup Example: adding couchbase defaults
  ///# // this function would allow a plugin author to define out their plugin defaults
  ///# config.options('couchbase', (plugin_options) => {
  ///#   ...validation...
  ///#   return Object.assign({
  ///#     server: '127.0.0.1',
  ///#     bucket: 'default',
  ///#     username: '',
  ///#     password: '',
  ///#     timeout: 5000
  ///#   }, plugin_options)
  ///# })
  ///#
  ///# config.runOptions()
  ///# @chainable
  runOptions (): Config {
    for (const [ key, value ] of entries(this._plugin_default_options)) {
      try {
        set(this.settings, key, value(get(this.settings, key)))
      } catch (e) {
        throw new FakeitError(e)
      }
    }
    return this
  }

  ///# @name cli
  ///# @description
  ///# The `cli` function allows you to add new options/commands to the cli. This is
  ///# mainly used for output type plugins like `@fakeit/plugin-couchbase`
  ///# @arg {function} fn - The function used to add options/commands to the cli
  ///# This function will be passed an instance of `[Caporal.js](https://github.com/mattallty/Caporal.js)`
  ///# that can be used to add the different things you wish to add. For mor information visit
  ///# their repo [Caporal.js](https://github.com/mattallty/Caporal.js)
  ///# @markup Example
  ///# config.cli((caporal, settings) => {
  ///#   // the cli instance will be passed in so that the different outputs can be added to it
  ///#   caporal
  ///#     .command('couchbase')
  ///#     // ...etc
  ///# })
  ///# @chainable
  cli (fn: Function): Config {
    fn = validate(fn, joi.func(), 'config.cli only accepts a function')

    debug('added cli fn:', fn)
    this._cli_plugins.push(fn)
    return this
  }

  ///# @name runCli
  ///# @arg {object} caporal - The caporal instance
  ///# @arg {function} next - The function that must be called inside of the `.action()`
  ///# @access private
  ///# @description This is used to run all the cli plugin functions
  ///# @async
  runCli (caporal: Object, next: Function): Promise<void> {
    /* istanbul ignore next : to hard to test, but it is accounted for */
    validate(
      ((caporal || {}).constructor || {}).name,
      joi.string()
        .regex(/^Program$/),
      'a Caporal.js instance must be passed in to `config.runCli()`',
    )
    return forEach(this._cli_plugins, (cliPlugin: Function) => cliPlugin(caporal, next))
  }

  ///# @name processor
  ///# @description
  ///# The processor function allows you to add in custom model processors.
  ///# For example the `@fakeit/plugin-yaml-model` plugin uses this function to convert
  ///# yaml files into js models so you can still write your models in yaml
  ///# @arg {string} ext - the file extension you're adding support for
  ///# @arg {function} fn - The function that will handle the files of the passed in `ext`
  ///# It's passed in 3 arguments
  ///#   - `contents` - A string of the files contents
  ///#   - `filepath` - The filepath to the contents
  ///#   - `settings` - The current settings
  ///# @markup Example
  ///# config.processor('yaml', (contents, filepath, settings) => {
  ///#   // parse the file in it's language
  ///#   // then convert it into the js model format aka (fakeit.build())
  ///#   return model
  ///# })
  ///# @chainable
  processor (ext: string, fn: Function): Config {
    ext = validate(
      ext,
      joi
        .string()
        .min(1)
        .max(6),
      (str: string) => str.replace('value', 'ext'),
    )
    fn = validate(fn, joi.func(), (str: string) => str.replace('value', 'fn'))
    debug(`added processor: ${ext}`)
    this.processors[ext] = fn
    return this
  }

  ///# @name output
  ///# @description
  ///# The output function allows you to add different output types. Anything from
  ///# outputting all the documents to a folder, to posting them over http, also adding
  ///# them to a couchbase bucket and more. For good examples see `@fakeit/plugin-couchbase`,
  ///# `@fakeit/plugin-file`, `@fakeit/plugin-directory`, `@fakeit/plugin-http`, etc.
  ///# @arg {string} type - The output type you're adding
  ///# @arg {function} fn - The function that will handle outputting each document
  ///# The function will be passed in the `document` as the first argument and then
  ///# the current `settings` for the second argument
  ///# @markup Example
  ///# // the output function should always be async
  ///# config.output('couchbase', async (document, settings) => {
  ///#   // `document` will be a single document that is ready to be output
  ///#   // `settings` is just the configuration that has been passed down
  ///# })
  ///# @chainable
  output (type: string, fn: Function): Config {
    type = validate(
      type,
      // for quality purposes we only allow lowercase a-z and a -
      joi.string()
        .regex(/^[a-z][a-z-]+[a-z]$/),
      (str: string) => str.replace('value', 'type'),
    )
    fn = validate(fn, joi.func(), (str: string) => str.replace('value', 'fn'))

    debug(`added output: ${type}`)
    this.outputs[type] = fn
    return this
  }
}
