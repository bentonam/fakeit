// @flow
import { get, merge } from 'lodash'

import Base from './types/base'
import FakeitArray from './types/array'
import FakeitObject from './types/object'

function model (): Object {
  /// @name Model
  /// @description This is base of the fakeit api
  // $FlowFixMe
  class Model extends Base {
    _options: Object

    document: Object

    is_root: boolean

    constructor () {
      super()
      this.document = {}

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
        inputs: {},

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
        ///# ```js
        ///# count ({ $inputs }) {
        ///#   // inputs would be `$inputs` to note that it's a dynamic
        ///#   return $inputs.countries.length
        ///# },
        ///# ```
        count: null,

        ///# @name _settings.before
        ///# @description This function will run 1 time before all the documents are generated
        ///# @type {null, function}
        ///# ```js
        ///# async before (t) { // t stands for context
        ///#   // Anything that would be set on `context` would be local to this model,
        ///#   // not other models in other files. This way there's no conflicts with
        ///#   // other models overwriting variables
        ///#   t.index = 0
        ///#
        ///#   // for those that would be curious you would still be able to
        ///#   // reference the count inside of a `before` function.
        ///#   t.$_settings.count = t.$inputs.countries.length
        ///# },
        ///# ```
        before: null,

        ///# @name _settings.beforeEach
        ///# @description This function will run before each document gets generated
        ///# @type {null, function}
        ///# ```js
        ///# beforeEach (t) {
        ///#   t.index = t.$chance.integer({ min: 0, max: t.$inputs.countries.length - 1 })
        ///# },
        ///# ```
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

      this.is_root = true
    }

    get settings (): Object {
      return this._settings
    }

    ///# @name options
    ///# @description This function allows you to pass in options for the model
    options (options: Object): Model {
      // to retreive the options use `fakeit.settings`
      this._settings = merge(this._settings, options || {})
      return this
    }

    _applyDefaults (Schema: Class<FakeitObject | FakeitArray | Base>): Object {
      const schema = new Schema()
      schema.model = this
      return schema
    }

    object (...args: Array<Object>): FakeitObject {
      const obj = this._applyDefaults(FakeitObject)
      return args.length ? obj.keys(...args) : obj
    }

    array (...args: Array<Object>): FakeitArray {
      const obj = this._applyDefaults(FakeitArray)
      return args.length ? obj.items(...args) : obj
    }
    // these functions are just pointing to the base class and it makes the code cleaner like this
    /* eslint-disable newline-per-chained-call */
    before (fn: Function): Base {
      return this._applyDefaults(Base).before(fn)
    }
    build (fn: Function): Base {
      return this._applyDefaults(Base).build(fn)
    }
    after (fn: Function): Base {
      return this._applyDefaults(Base).after(fn)
    }
    odds (odds: number): Base {
      return this._applyDefaults(Base).odds(odds)
    }
    /* eslint-enable newline-per-chained-call */

    // @todo probably remove this
    ref (ref: string): mixed {
      return get(this.document, ref)
    }
  }

  return new Model()
}

export default model()
export { model }
