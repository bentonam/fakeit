// The majority of the tests for base are in `test/model/index.test.js`
import ava from 'ava-spec'
import { isFunction } from 'lodash'

import Base from '../../../dist/model/types/base'

const test = ava.group('model:types:base')
test('init', (t) => {
  const actual = new Base()
  t.truthy(isFunction(actual))
  t.falsy(actual.is_root)
  t.truthy(actual.is_fakeit)
  t.snapshot(actual.inner)
})
