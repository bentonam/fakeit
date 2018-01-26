// The majority of the tests for array are in `test/model/index.test.js`
import ava from 'ava-spec'
import { isFunction } from 'lodash'

import FakeitArray from '../../../dist/model/types/array'

const test = ava.group('model:types:array')
test('init', (t) => {
  const actual = new FakeitArray()
  t.truthy(isFunction(actual))
  t.falsy(actual.is_root)
  t.truthy(actual.is_fakeit)
  t.snapshot(actual.inner)
})
