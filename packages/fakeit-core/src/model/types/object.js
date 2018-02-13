// @flow

import joi from 'joi'
import Base from './base'

import { validate } from '../../utils'

/// @name Object
/// @page fakeit-core/types
/// @description This is used to create arrays of fake data
export default class FakeitObject extends Base {
  constructor () {
    super()
    this.inner.value = {}
  }

  // eslint-disable-next-line
  get schema(): string {
    return 'object'
  }

  ///# @name keys
  ///# @description This is used to create the fake items in an object
  ///# @arg {*} ...keys - For each key in the object you pass in you can
  ///# pass in data types to items, as well as a `fakeit` specific function,
  ///# like `fakeit.object`, `fakeit.build`, etc
  ///# @markup Example
  ///# // you can pass in a fakeit build function
  ///# fakeit.object().keys({
  ///#   _id: fakeit.after((t) => `contact_${t.$doc.contact_id}`),
  ///#   doc_type: 'contact', // static data
  ///#   channels: [ 'ufp-555555555' ], // static data
  ///#   contact_id: fakeit.build((t) => t.$chance.guid()),
  ///#   created_on: fakeit.build((t) => new Date(t.$faker.date.past()).getTime()),
  ///#   modified_on: fakeit.build((t) => new Date(t.$faker.date.recent()).getTime()),
  ///# })
  keys (...keys: Array<Object>): Object {
    keys = validate(keys, joi.array()
      .items(joi.object()
        .min(1)))
    const obj = this.clone()
    Object.assign(obj.inner.value || {}, ...keys)
    return obj
  }
}
