// @flow
import buildDebug from 'debug'
import { cloneDeep } from 'lodash'

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
///   const defaults = {
///     server: '127.0.0.1',
///     bucket: 'default',
///     username: '',
///     password: '',
///     timeout: 5000
///   }
///   config.options('couchbase', defaults, (plugin_options) => {
///     // `plugin_options` would be the result of the defaults
///     // merged with the options passed in the config/cli
///
///     // we could expose the validate function and joi to make it easy to add validation
///     // config.validate(plugin_options, config.joi.object())
///     return plugin_options
///   })
///
///   config.cli((caporal) => {
///     // the cli instance will be passed in so that the different outputs can be added to it
///     caporal
///       .command('couchbase')
///       // ...etc
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
  cli_plugins: Function[] = []
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
    // @todo add validation
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
    // @todo add validations
    debug(`added format: ${ext}`)
    this.formats[ext] = parse_stringify
    return this
  }

  ///# @name options
  ///# @description
  ///# The `options` function allows you to pass in default options,
  ///# and run any validation that you want to run against the options that
  ///# were set.
  ///# @arg {string} name - The name of the options
  ///# @arg {object} defaults - Whatever the defaults are that you want to set
  ///# @arg {function} fn - The function to run validation against any options that were passed in.
  ///# This validation function is optional. If you do use this function you are required to return
  ///# the options that you want to end up using and those will be set globally
  ///# @markup Example: adding couchbase defaults
  ///# // this function would allow a plugin author to define out their plugin defaults
  ///# const defaults = {
  ///#   server: '127.0.0.1',
  ///#   bucket: 'default',
  ///#   username: '',
  ///#   password: '',
  ///#   timeout: 5000
  ///# }
  ///# config.options('couchbase', defaults, (plugin_options) => {
  ///#   ...validation...
  ///#   return plugin_options
  ///# })
  ///# @chainable
  options (name: string, defaults: Object, fn: Function = (options: mixed) => options): Config {
    // @todo add validations
    debug(`added option defaults: ${name}`)

    this.options[name] = {
      defaults: cloneDeep(defaults),
      fn,
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
  ///# config.cli((caporal) => {
  ///#   // the cli instance will be passed in so that the different outputs can be added to it
  ///#   caporal
  ///#     .command('couchbase')
  ///#     // ...etc
  ///# })
  ///# @chainable
  cli (fn: Function): Config {
    // @todo add validations
    debug('added cli fn:', fn)
    if (typeof fn === 'function') {
      this.cli_plugins.push(fn)
    }
    return this
  }

  ///# @name runCli
  ///# @access private
  ///# @description This is used to run all the cli plugin functions
  ///# @chainable
  runCli (caporal: Object): Config {
    for (const plugin of this.cli_plugins) {
      plugin(caporal)
    }
    return this
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
    // @todo add validations
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
    // @todo add validations
    debug(`added output: ${type}`)
    this.outputs[type] = fn
    return this
  }
}
