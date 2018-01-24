// @flow

import Base from './base'

export default class FakeitObject extends Base {
  constructor () {
    super()
    this._type = 'FakeitObject'
    this.inner.value = {}
  }

  keys (...keys: Array<Object>): Object {
    const obj = this.clone()
    Object.assign(obj.inner.value || {}, ...keys)
    return obj
  }
}
