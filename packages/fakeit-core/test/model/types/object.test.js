// The majority of the tests for object are in `test/model/index.test.js`
import ava from 'ava-spec'
import { isFunction } from 'lodash'

import FakeitObject from '../../../dist/model/types/object'

const test = ava.group('model:types:object')
test('init', (t) => {
  const actual = new FakeitObject()
  t.truthy(isFunction(actual))
  t.falsy(actual.is_root)
  t.truthy(actual.is_fakeit)
  t.snapshot(actual.inner)
})
