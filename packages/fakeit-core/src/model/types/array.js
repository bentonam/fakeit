// @flow
/* eslint-disable newline-per-chained-call */

import _ from 'lodash'
import joi from 'joi'

import { validate } from '../../utils'
import Base from './base'

/// @name Array
/// @page fakeit-core/types
/// @description This is used to create arrays of fake data
export default class FakeitArray extends Base {
  constructor () {
    super()
    ///# @name inner.options.min
    ///# @description This is the min number of documents that can potentially get created
    ///# @type {number, function}
    ///# @note If `options.length` is defined then this is ignored
    this.inner.options.min = 1

    ///# @name inner.options.max
    ///# @description This is the max number of documents that can potentially get created
    ///# @type {number, function}
    ///# @note If `inner.options.count` is defined then this is ignored
    this.inner.options.max = 100

    ///# @name inner.options.length
    ///# @description This declares the exact number items in this array
    ///# @type {null, number, function}
    this.inner.options.length = null

    ///# @name inner.options.unique
    ///# @description A function that is used to create a unique array
    ///# @type {null, function}
    this.inner.options.unique = null

    ///# @name inner.options.filter
    ///# @description A function that is used to filter the array
    ///# @type {null, function}
    this.inner.options.filter = null

    this.inner.value = []
  }

  // eslint-disable-next-line
  get schema(): string {
    return 'array'
  }

  ///# @name items
  ///# @description This is used to create the fake items in the array
  ///# @arg {*} ...schemas - you can pass in data types to items, as well
  ///# as a `fakeit` specific function, like `fakeit.object`, `fakeit.build`, etc
  ///# @chainable
  ///# @markup Example
  ///# // you can pass in a fakeit build function
  ///# fakeit.array()
  ///#   .items(fakeit.build((t) => `${t.$faker.name.firstName()} ${t.$faker.name.lastName()}`))
  ///# @markup Example
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
  items (...schemas: Array<mixed>): Class<FakeitArray> {
    schemas = validate(schemas, joi.array().items(joi.array().min(1)))
    const obj = this.clone()
    for (const schema of _.flattenDeep(schemas)) {
      obj.inner.value.push(schema)
    }
    return obj
  }

  ///# @name min
  ///# @description This declares the min number items in this array
  ///# @arg {number} min
  ///# @chainable
  ///# @note Will not be taken into account if `.length()` is declared
  min (min: number): Class<FakeitArray> {
    const obj = this.clone()
    if (obj.inner.options.length == null) {
      min = validate(min, joi.number().min(0), `min must be a number, you passed in "${min}"`)
      obj.inner.options.min = min

      // ensure that the max value is never less than or equal to the min
      if (min >= obj.inner.options.max) {
        obj.inner.options.max = min + 100
      }
    }
    return obj
  }

  ///# @name min
  ///# @description This declares the max number items in this array
  ///# @arg {number} max
  ///# @chainable
  ///# @note Will not be taken into account if `.length()` is declared
  max (max: number): Class<FakeitArray> {
    const obj = this.clone()
    if (obj.inner.options.length == null) {
      obj.inner.options.max = validate(
        max,
        joi.number().min(obj.inner.options.min + 1),
        `max must be a number, you passed in "${max}"`,
      )
    }
    return obj
  }

  ///# @name length
  ///# @description This declares the exact number items in this array
  ///# @arg {number} length
  ///# @chainable
  length (length: number | Function): Class<FakeitArray> {
    const obj = this.clone()
    obj.inner.options.min = null
    obj.inner.options.max = null
    obj.inner.options.length = validate(
      length,
      joi.alternatives().try(null, joi.number(), joi.func()),
      `length must be a number or a function, you passed in "${length.toString()}"`,
    )
    return obj
  }

  ///# @name unique
  ///# @description This will convert the array that was generated into a unique array
  ///# @arg {null, string, function} unique - The same arguments that
  ///# are passed into [_.uniqBy](https://lodash.com/docs/4.17.4#uniqBy) from lodash starting
  ///# with the second argument
  ///# @chainable
  unique (unique: string | Function | null = null): Class<FakeitArray> {
    const obj = this.clone()
    unique = validate(
      unique,
      joi.alternatives().try(null, joi.func(), joi.string()),
      'unique must be null, function, or string. It uses lodash `uniq` or `uniqBy` behind the scenes',
    )
    let fn
    if (unique == null) {
      fn = _.uniq
    } else {
      fn = (list: Array<mixed>): Array<mixed> => _.uniqBy(list, unique)
    }

    obj.inner.options.unique = fn

    return obj
  }

  ///# @name filter
  ///# @description This will filter out any values that you don't want.
  ///# It will replace the need for this
  ///# ```js
  ///# fakeit.array()
  ///#   .items(fakeit.build((t) => t.$faker.name.firstName()).odds(20))
  ///#   .filter() // this is exactly the same thing as this after function
  ///#   .after((t) => {
  ///#     // FOR THOSE THAT ONLY SEE ALL CAPS, NO NEED TO DO THIS just use `.filter()`
  ///#     t.value = _.filter(t.value, (item) => item != null || !Number.isNaN(filter))
  ///#   })
  ///# ```
  ///# @arg {function, string, array, object, null} unique [null] - The same arguments that
  ///# are passed into [_.filter](https://lodash.com/docs/4.17.4#filter) from lodash starting
  ///# with the second argument
  ///# The only difference is that if you don't pass anything into the filter function
  ///# it will filter out `null`, `undefined`, and `NaN` values
  ///# @chainable
  filter (filter: Function | string | Array<mixed> | Object | null = null): Class<FakeitArray> {
    const obj = this.clone()
    filter = validate(
      filter,
      joi
        .alternatives()
        .try(joi.func(), joi.string(), joi.array().min(1), joi.object().min(1), null),
      'filter must be function, string, array, object, or null. It uses lodash `filter` behind the scenes',
    )
    if (filter == null) {
      filter = (item: mixed): mixed => item != null && !_.isNaN(item)
    }

    // I have no idea what's wrong with flow. It's saying Array isn't a valid type
    // $FlowFixMe
    const fn = (list: Array<mixed>): Array<mixed> => _.filter(list, filter)

    obj.inner.options.filter = fn
    return obj
  }
}
