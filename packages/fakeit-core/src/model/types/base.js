// @flow

import { cloneDeep } from 'lodash'
import CallableInstance from 'callable-instance'
import joi from 'joi'

import { validate } from '../../utils'

const func_schema = joi.alternatives()
  .try(joi.func(), null)

/// @name Base
/// @page fakeit-core/types
/// @description This is the base class that is applied to the object and array class
export default class Base extends CallableInstance {
  functions: Object

  inner: Object

  is_fakeit = true
  is_root = false

  rootModel: Object

  constructor () {
    super('build')
    this.is_root = false
    this.inner = {
      // this is defined on each class the base is applied to
      value: null,
      options: {
        odds: null,
        before: null,
        beforeEach: null,
        build: null,
        after: null,
        afterEach: null,
      },
    }
  }

  // eslint-disable-next-line
  get schema(): string {
    return 'base'
  }

  get settings (): Object {
    return this.rootModel.settings
  }

  ///# @name clone
  ///# @description This makes a clone of the current instance
  ///# @returns {class} the cloned class
  ///# @chainable
  clone (): Object {
    // $FlowFixMe
    const obj = Object.create(Object.getPrototypeOf(this))
    obj.is_fakeit = true
    obj.rootModel = this.rootModel
    obj.inner = cloneDeep(this.inner)
    return obj
  }

  ///# @name before
  ///# @description This is used to run a function before the document is generated
  ///# @arg {function} - The function to run
  ///# @chainable
  ///# @markup Example:
  ///# export default fakeit
  ///#  .object({
  ///#    foo: fakeit.before((t) => t.$faker.name.firstName()),
  ///#  })
  before (fn: Function): Class<Base> {
    // this validation looks a little weird but it makes the error reporting much better
    fn = validate({ before: fn }, joi.object({ before: func_schema })).before
    const obj = this.clone()
    obj.inner.options.before = fn
    return obj
  }

  ///# @name build
  ///# @description This is used to run a function to generate the document
  ///# @arg {function} - The function to run
  ///# @chainable
  ///# @markup Example:
  ///# export default fakeit
  ///#  .object({
  ///#    first_name: fakeit.build((t) => t.$faker.name.firstName()),
  ///#    last_name: fakeit((t) => t.$faker.name.lastName()) // this does the same thing
  ///#  })
  build (fn: Function): Class<Base> {
    // this validation looks a little weird but it makes the error reporting much better
    fn = validate({ build: fn }, joi.object({ build: func_schema })).build
    const obj = this.clone()
    obj.inner.options.build = fn
    return obj
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
  after (fn: Function): Class<Base> {
    // this validation looks a little weird but it makes the error reporting much better
    fn = validate({ after: fn }, joi.object({ after: func_schema })).after
    const obj = this.clone()
    obj.inner.options.after = fn
    return obj
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
  odds (odds: number = 50): Class<Base> {
    const obj = this.clone()
    obj.inner.options.odds = validate(
      odds,
      joi
        .number()
        .min(0)
        .max(100),
      `odds expects a number between 1 and 100, you passed in "${odds}"`,
    )
    return obj
  }

  run (): Class<Base> {
    const obj = this.clone()
    return obj
  }
}
