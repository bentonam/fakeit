// @flow

////
/// @name @fakeit/core
/// @page fakeit-core
////

import { get, merge } from 'lodash'
import joi from 'joi'
import autoBind from 'auto-bind'
import Base from './types/base'
import FakeitArray from './types/array'
import FakeitObject from './types/object'
import { validate } from '../utils'

type DependenciesType = {
  model: string,
  sample: number,
}

type InputsType = {
  model: string,
  sample: number,
}

type SettingsType = {
  name: string,
  key: string,
  dependencies: DependenciesType[],
  inputs: InputsType[],
  min: number,
  max: number,
  count: null | number | Function,
  before: null | Function,
  beforeEach: null | Function,
  after: null | Function,
  afterEach: null | Function,
  seed: number | string,
}

type InnerType = {
  value: mixed[] | Object,
}

export interface ModelInterface {
  is_fakeit: boolean;
  model?: ModelInterface;
  settings: SettingsType;
  inner: InnerType;
  file: string;
  root: string;
  is_dependency: boolean;
  dependants?: [];
  options(options: Object): ModelInterface;
  object(...args: Object[]): FakeitObject;
  array(...args: Array<Object>): FakeitArray;
  before(fn: Function): Base;
  build(fn: Function): Base;
  after(fn: Function): Base;
  odds(odds: number): Base;
  ref(ref: string): mixed;
  pid?: number;
}

/// @name Model
/// @description This is base of the fakeit api
// $FlowFixMe
export default class Model extends Base {
  _options: Object

  document: Object

  is_root: boolean

  constructor () {
    super()
    this.document = {}

    ///# @name _settings
    ///# @access private
    ///# @description
    ///# The object that holds all the model options. This can't be accessed outside of the class
    ///# so that it can't be modified without running through validation
    ///# @type {object}
    this._settings = {
      ///# @name _settings.name
      ///# @description the name of the model.
      ///# @required
      ///# @type {string}
      name: '',

      ///# @name _settings.key
      ///# @description This determins the key used for the document
      ///# be derived from the file name it's being used in
      ///# @required
      ///# @type {string, function}
      ///# @note can't be an async function.
      key: '',

      ///# @name _settings.dependencies
      ///# @description the name of the model. If there isn't a name it will
      ///# be derived from the file name it's being used in
      ///# @type {array} - This is an array of strings
      dependencies: [],

      ///# @name _settings.inputs
      ///# @description Any inputs that are required for the generation of the data for the model
      ///# @type {object}
      ///# The key is what you will use to get the data.
      ///# The value can be a string to a file path or a url or an async function
      inputs: [],

      ///# @name _settings.min
      ///# @description This is the min number of documents that can potentially get created
      ///# @type {number, function}
      ///# @note If `_settings.count` is defined then this is ignored
      min: 1,

      ///# @name _settings.max
      ///# @description This is the max number of documents that can potentially get created
      ///# @type {number, function}
      ///# @note If `_settings.count` is defined then this is ignored
      max: 1000,

      ///# @name _settings.count
      ///# @description This is the count for number of documents that will get created
      ///# @type {null, number, function}
      ///# @markup
      ///# count ({ $inputs }) {
      ///#   // inputs would be `$inputs` to note that it's a dynamic
      ///#   return $inputs.countries.length
      ///# },
      count: null,

      ///# @name _settings.before
      ///# @description This function will run 1 time before all the documents are generated
      ///# @type {null, function}
      ///# @markup
      ///# async before (t) { // t stands for context
      ///#   // Anything that would be set on `context` would be local to this model,
      ///#   // not other models in other files. This way there's no conflicts with
      ///#   // other models overwriting variables
      ///#   t.index = 0
      ///#
      ///#   // for those that would be curious you would still be able to
      ///#   // reference the count inside of a `before` function.
      ///#   t.$count = t.$inputs.countries.length
      ///# },
      before: null,

      ///# @name _settings.beforeEach
      ///# @description This function will run before each document gets generated
      ///# @type {null, function}
      ///# @markup
      ///# beforeEach (t) {
      ///#   t.index = t.$chance.integer({ min: 0, max: t.$inputs.countries.length - 1 })
      ///# },
      beforeEach: null,

      ///# @name _settings.after
      ///# @description This function will run 1 time before all the documents are generated
      ///# @type {null, function} same as `_settings.before`
      after: null,

      ///# @name _settings.afterEach
      ///# @description This function will run after each document gets generated
      ///# @type {null, function} same as `_settings.beforeEach`
      afterEach: null,

      ///# @name _settings.seed
      ///# @description This is the seed that will be passed to plugins like faker and chance
      ///# @type {number, string}
      seed: 0,
    }

    ///# @name is_root
    ///# @description This is to identify that this instance is the root
    ///# @type {boolean}
    this.is_root = true

    delete this.inner

    // auto binds methods to it's instance
    autoBind(this)
  }

  get settings (): SettingsType {
    return this._settings
  }

  ///# @name options
  ///# @description This function allows you to pass in options for the model
  ///# @arg {object} options - The options that are be used on the model
  ///# @chainable
  options (options: Object): Model {
    const inputs_values = joi
      .alternatives()
      .try(joi.string()
        .regex(/.+\.[a-z]{1,6}$|^http.+/), joi.func())
    // to retreive the options use `fakeit.settings`
    const schema = joi.object({
      name: joi
        .string()
        .min(1)
        .required(),
      key: joi
        .alternatives()
        .try(joi.string(), joi.func())
        .required(),
      dependencies: joi
        .array()
        .items(joi
          .alternatives()
          .try(joi.string(), joi.object({ model: joi.string(), sample: joi.number() }))),
      inputs: joi.array()
        .items(joi.alternatives()
          .try(
            inputs_values,
            joi.object({
              input: inputs_values,
              sample: joi.number(),
            }),
          )),
      min: joi.number(),
      max: joi.number(),
      count: joi.alternatives()
        .try(null, joi.number(), joi.func()),
      before: joi.alternatives()
        .try(joi.func(), null),
      beforeEach: joi.alternatives()
        .try(joi.func(), null),
      afterEach: joi.alternatives()
        .try(joi.func(), null),
      after: joi.alternatives()
        .try(joi.func(), null),
      seed: joi.alternatives()
        .try(joi.number(), joi.string()),
    })

    const valid_options = validate(options, schema) || {}

    function sample (key: string): Function {
      return (item: string | Object): Object => {
        if (typeof item === 'string') {
          return { [key]: item, sample: 100 }
        }
        return item
      }
    }

    if (valid_options.dependencies) {
      valid_options.dependencies = valid_options.dependencies.map(sample('model'))
    }

    if (valid_options.inputs) {
      valid_options.inputs = valid_options.inputs.map(sample('input'))
    }

    this._settings = merge(this._settings, valid_options)

    return this
  }

  ///# @name _applyDefaults
  ///# @private
  ///# @description This sets the current instance onto the class that's passed to it as the model
  ///# @arg {class} Schema - The class to apply the defaults to
  ///# @chainable
  _applyDefaults (Schema: Class<FakeitObject | FakeitArray | Base>): Object {
    const schema = new Schema()
    schema.rootModel = this
    return schema
  }
  /* eslint-disable newline-per-chained-call */
  ///# @name object
  ///# @description This is used to create arrays of fake data
  ///# @arg {*} ...args - For each key in the object you pass in you can
  ///# pass in data types to items, as well as a `fakeit` specific function,
  ///# like `fakeit.object`, `fakeit.build`, etc
  ///#
  ///# @markup Example
  ///# fakeit.object().keys({ foo: '' })
  ///# fakeit.object({ foo: '' }) // shorthand
  ///#
  ///# @markup Example
  ///# // you can pass in a fakeit build function
  ///# fakeit.object({
  ///#   _id: fakeit.after((t) => `contact_${t.$doc.contact_id}`),
  ///#   doc_type: 'contact', // static data
  ///#   channels: [ 'ufp-555555555' ], // static data
  ///#   contact_id: fakeit.build((t) => t.$chance.guid()),
  ///#   created_on: fakeit.build((t) => new Date(t.$faker.date.past()).getTime()),
  ///#   modified_on: fakeit.build((t) => new Date(t.$faker.date.recent()).getTime()),
  ///# })
  ///# @chainable
  object (...args: Object[]): FakeitObject {
    const obj = this._applyDefaults(FakeitObject)
    return args.length ? obj.keys(...args) : obj
  }

  ///# @name array
  ///# @description This is used to create the fake items in the array
  ///# @arg {*} ...schemas - you can pass in data types to items, as well
  ///# as a `fakeit` specific function, like `fakeit.object`, `fakeit.build`, etc
  ///# @chainable
  ///# @markup Example
  ///# fakeit.array().items([ ... ])
  ///# fakeit.array([ ... ]) // shorthand
  ///# @markup Example passing in `fakeit.build`
  ///# // you can pass in a fakeit build function
  ///# fakeit.array()
  ///#   .items(fakeit.build((t) => `${t.$faker.name.firstName()} ${t.$faker.name.lastName()}`))
  ///# @markup Example passing in static data
  ///# // you can also pass in any js data type
  ///# // in this example it will choose a random number of these names between 2 and 6
  ///# fakeit.array()
  ///#   .items([
  ///#     'T'varisuness King',
  ///#     'Davoin Shower-Handel',
  ///#     'Hingle McCringleberry',
  ///#     'J'Dinkalage Morgoone',
  ///#     'Xmus Jaxon Flaxon-Waxon',
  ///#     'Quatro Quatro',
  ///#     'Shakiraquan T.G.I.F. Carter',
  ///#     'T.J. A.J. R.J. Backslashinfourth V',
  ///#     'The Player Formerly Known as Mousecop',
  ///#   ])
  ///#   .min(2)
  ///#   .max(6)
  array (...args: Array<Object>): FakeitArray {
    const obj = this._applyDefaults(FakeitArray)
    return args.length ? obj.items(...args) : obj
  }

  // these functions are just pointing to the base class and it makes the code cleaner like this
  ///# @name before
  ///# @description This is used to run a function before the document is generated
  ///# @arg {function} - The function to run
  ///# @chainable
  ///# @markup Example:
  ///# export default fakeit
  ///#  .object({
  ///#    foo: fakeit.before((t) => t.$faker.name.firstName()),
  ///#  })
  before (fn: Function): Base {
    return this._applyDefaults(Base).before(fn)
  }

  ///# @name build
  ///# @description This is used to run a function to generate the document
  ///# @arg {function} - The function to run
  ///# @chainable
  ///# @markup Example:
  ///# fakeit.build((t) => ...),
  ///# fakeit((t) => ...) // shorthand
  ///# @markup Example:
  ///# export default fakeit
  ///#  .object({
  ///#    first_name: fakeit.build((t) => t.$faker.name.firstName()),
  ///#    last_name: fakeit((t) => t.$faker.name.lastName()) // this does the same thing
  ///#  })
  build (fn: Function): Base {
    return this._applyDefaults(Base).build(fn)
  }

  ///# @name after
  ///# @description This is used to run a function to generate the document
  ///# @arg {function} - The function to run
  ///# @chainable
  ///# @markup Example:
  ///# export default fakeit
  ///#  .object({
  ///#    first_name: fakeit.build((t) => t.$faker.name.firstName()),
  ///#    last_name: fakeit.build((t) => t.$faker.name.lastName()),
  ///#    name: fakeit.after((t) => `${t.$doc.first_name} ${t.$doc.last_name}`),
  ///#  })
  after (fn: Function): Base {
    return this._applyDefaults(Base).after(fn)
  }
  ///# @name odds
  ///# @description
  ///# Running this function is making the current item it's being applied to have x odds
  ///# that it will run. If it doesn't run then the key it was being applied to will be `null`.
  ///# Basically it's a short hand for this.
  ///# ```js
  ///# fakeit
  ///#   .build((t) => {
  ///#     return t.$chance.bool({ likelihood: 70 }) ? t.$faker.name.lastName() : null
  ///#   })
  ///# ```
  ///# This is used to run a function to generate the document
  ///# @arg {number} number [50] - The odds that the function should run
  ///# @chainable
  ///# @markup Example:
  ///# fakeit
  ///#   .build((t) => t.$faker.name.lastName())
  ///#   .odds(70)
  odds (odds: number = 50): Base {
    return this._applyDefaults(Base).odds(odds)
  }
  /* eslint-enable newline-per-chained-call */

  // @todo probably remove this
  ref (ref: string): mixed {
    return get(this.document, ref)
  }
}
