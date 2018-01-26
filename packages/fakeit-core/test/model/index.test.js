import ava from 'ava-spec'
import { isFunction, isPlainObject, isEmpty, isArray } from 'lodash'

import fakeit, { model } from '../../dist/model'

const test = ava.group('model:index')

test.group('options', (test) => {
  test('get', (t) => {
    t.snapshot(fakeit.options)
    t.snapshot(model().options)
  })
  test.group('set', (test) => {
    test('all valid', (t) => {
      t.notThrows(() => {
        fakeit.options({
          name: 'something',
          key: '_woohoo',
          dependencies: [ '../foo/something.js', 'bar' ],
          inputs: {
            content: 'path/to/some/string.json',
            something: 'http://path/to/some/url',
            woohoo () {},
          },
          min: 20,
          max: 50,
          count () {},
          before () {},
          beforeEach () {},
          after () {},
          afterEach () {},
          seed: 'woohoo',
        })
      })
    })

    test.group('invalid', (test) => {
      const base = { name: 'name', key: '_id' }
      const b = (obj) => Object.assign({}, base, obj)
      test('name', (t) => {
        const error = t.throws(() => {
          fakeit.options({
            name: '',
          })
        })
        t.snapshot(error)
      })
      test('key', (t) => {
        const error = t.throws(() => {
          fakeit.options({
            name: 'name',
            key: '',
          })
        })
        t.snapshot(error)
      })
      test('dependencies', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            dependencies: {},
          }))
        })
        t.snapshot(error)
      })
      test('inputs', (t) => {
        const one = t.throws(() => {
          fakeit.options(b({
            inputs: {
              content: '',
            },
          }))
        })
        t.snapshot(one)
        const two = t.throws(() => {
          fakeit.options(b({
            inputs: {
              content: '../foo',
            },
          }))
        })
        t.snapshot(two)
      })

      test('min', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            min () {},
          }))
        })
        t.snapshot(error)
      })
      test('max', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            max () {},
          }))
        })
        t.snapshot(error)
      })
      test('before', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            before: '',
          }))
        })
        t.snapshot(error)
      })
      test('beforeEach', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            beforeEach: '',
          }))
        })
        t.snapshot(error)
      })
      test('afterEach', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            afterEach: '',
          }))
        })
        t.snapshot(error)
      })
      test('after', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            after: '',
          }))
        })
        t.snapshot(error)
      })
      test('seed', (t) => {
        const error = t.throws(() => {
          fakeit.options(b({
            seed () {},
          }))
        })
        t.snapshot(error)
      })
    })
  })
})

test.group('before', (test) => {
  test('model was set correctly', (t) => {
    const actual = fakeit.before()
    t.truthy(isFunction(actual.model))
  })
  test('inner.options.before was set correctly', (t) => {
    const actual = fakeit.before(() => 'woohoo')
    t.truthy(isFunction(actual.inner.options.before))
  })
  test("throws when function isn't passed", (t) => {
    const error = t.throws(() => {
      fakeit.before('something')
    })
    t.snapshot(error)
  })
})

test.group('build', (test) => {
  test('fakeit() and fakeit.build() after the same thing', (t) => {
    t.deepEqual(fakeit(), fakeit.build())
  })
  test('model was set correctly', (t) => {
    const actual = fakeit.build()
    t.truthy(isFunction(actual.model))
  })
  test('inner.options.build was set correctly', (t) => {
    const actual = fakeit.build(() => 'woohoo')
    t.truthy(isFunction(actual.inner.options.build))
  })
  test("throws when function isn't passed", (t) => {
    const error = t.throws(() => {
      fakeit.build('something')
    })
    t.snapshot(error)
  })
})

test.group('after', (test) => {
  test('model was set correctly', (t) => {
    const actual = fakeit.after()
    t.truthy(isFunction(actual.model))
  })
  test('inner.options.after was set correctly', (t) => {
    const actual = fakeit.after(() => 'woohoo')
    t.truthy(isFunction(actual.inner.options.after))
  })
  test("throws when function isn't passed", (t) => {
    const error = t.throws(() => {
      fakeit.after('something')
    })
    t.snapshot(error)
  })
})

test.group('object', (test) => {
  test('model was set correctly', (t) => {
    const actual = fakeit.object()
    t.truthy(isFunction(actual.model))
  })
  test('inner.options.object was set correctly', (t) => {
    const expected = { foo: 'bar' }
    const actual = fakeit.object(expected)
    t.truthy(isPlainObject(actual.inner.value))
    t.falsy(isEmpty(actual.inner.value))
    t.deepEqual(actual.inner.value, expected)
  })
  test('fakeit.object().keys() works correctly', (t) => {
    const expected = { foo: 'foo', bar: fakeit.build(() => 'woohoo') }
    const actual = fakeit.object().keys(expected)
    t.truthy(isPlainObject(actual.inner.value))
    t.falsy(isEmpty(actual.inner.value))
    t.deepEqual(actual.inner.value, expected)
  })
  test("throws when object isn't passed", (t) => {
    const error = t.throws(() => {
      fakeit.object(() => 'woohoo')
    })
    t.snapshot(error)
  })
  test("throws when object is passed but doesn't have any keys", (t) => {
    const error = t.throws(() => {
      fakeit.object({})
    })
    t.snapshot(error)
  })
})

test.group('array', (test) => {
  test('model was set correctly', (t) => {
    const actual = fakeit.array()
    t.truthy(isFunction(actual.model))
  })

  test('inner.options.array was set correctly', (t) => {
    const expected = [ 'woohoo', fakeit.build(() => 'woohoo') ]
    const actual = fakeit.array(expected)
    t.truthy(isArray(actual.inner.value))
    t.falsy(isEmpty(actual.inner.value))
    t.deepEqual(actual.inner.value, expected)
  })

  test('fakeit.array().items() works correctly', (t) => {
    const expected = [ 'woohoo', fakeit.build(() => 'woohoo') ]
    const actual = fakeit.array().items(expected)
    t.truthy(isArray(actual.inner.value))
    t.falsy(isEmpty(actual.inner.value))
    t.deepEqual(actual.inner.value, expected)
  })

  test("throws when array isn't passed", (t) => {
    const error = t.throws(() => {
      fakeit.array(() => 'woohoo')
    })
    t.snapshot(error)
  })

  test("throws when array is passed but doesn't have any items", (t) => {
    const error = t.throws(() => {
      fakeit.array([])
    })
    t.snapshot(error)
  })

  test.group('min', (test) => {
    test('valid', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).min(20)
      t.is(actual.inner.options.min, 20)
      t.is(actual.inner.options.max, 100)
    })
    test('converts max to be 100 more than what was set', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).min(200)
      t.is(actual.inner.options.min, 200)
      t.is(actual.inner.options.max, 300)
    })

    test('invalid', (t) => {
      const error = t.throws(() => {
        fakeit.array([ 'woohoo' ]).min('asdfasdf')
      })
      t.snapshot(error)
    })
  })

  test.group('max', (test) => {
    test('valid', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).max(200)

      t.is(actual.inner.options.max, 200)
    })

    test('invalid', (t) => {
      const error = t.throws(() => {
        fakeit.array([ 'woohoo' ]).max('asdfasdf')
      })
      t.snapshot(error)
    })
  })

  test.group('length', (test) => {
    test('valid number', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).length(200)
      t.is(actual.inner.options.length, 200)
    })

    test('valid function', (t) => {
      const expected = () => 200
      const actual = fakeit.array([ 'woohoo' ]).length(expected)
      t.is(actual.inner.options.length, expected)
    })

    test('unsets min and max when length is set', (t) => {
      const actual = fakeit
        .array([ 'woohoo' ])
        .length(200)
        .min(20)
        .max(80)
      t.is(actual.inner.options.min, null)
      t.is(actual.inner.options.max, null)
      t.is(actual.inner.options.length, 200)
    })

    test('invalid', (t) => {
      const error = t.throws(() => {
        fakeit.array([ 'woohoo' ]).length('asdfasdf')
      })
      t.snapshot(error)
    })
  })

  test.group('unique', (test) => {
    test('valid', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).unique()
      t.truthy(isFunction(actual.inner.options.unique))
    })

    test('valid function', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).unique(() => true)
      t.truthy(isFunction(actual.inner.options.unique))
      t.regex(actual.inner.options.unique.toString(), /\.uniqBy\(list/)
    })

    test('valid string', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).unique('woohoo')
      t.truthy(isFunction(actual.inner.options.unique))
      t.regex(actual.inner.options.unique.toString(), /\.uniqBy\(list/)
    })

    test('invalid', (t) => {
      const error = t.throws(() => {
        fakeit.array([ 'woohoo' ]).unique(1000)
      })
      t.snapshot(error)
    })
  })

  test.group('filter', (test) => {
    test('valid', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).filter()
      t.truthy(isFunction(actual.inner.options.filter))
      t.deepEqual(actual.inner.options.filter([ 'foo', null ]), [ 'foo' ])
    })

    test('valid custom', (t) => {
      const actual = fakeit.array([ 'woohoo' ]).filter(() => true)
      t.truthy(isFunction(actual.inner.options.filter))
      t.regex(actual.inner.options.filter.toString(), /\.filter\(list/)
      const expected = [ 'foo', null ]
      t.deepEqual(actual.inner.options.filter(expected), expected)
    })

    test('invalid', (t) => {
      const error = t.throws(() => {
        fakeit.array([ 'woohoo' ]).filter(1000)
      })
      t.snapshot(error)
    })
  })
})

test.group('odds', (test) => {
  test('valid', (t) => {
    const actual = fakeit.odds(10)
    t.is(actual.inner.options.odds, 10)
  })
  test('invalid', (t) => {
    t.snapshot(t.throws(() => fakeit.odds(-1)))
    t.snapshot(t.throws(() => fakeit.odds(101)))
    t.snapshot(t.throws(() => fakeit.odds('woohoo')))
  })
})

test.group('schema', (test) => {
  test('object', (t) => {
    t.is(fakeit.object().schema, 'object')
  })
  test('array', (t) => {
    t.is(fakeit.array().schema, 'array')
  })
  test('before', (t) => {
    t.is(fakeit.before().schema, 'base')
  })
  test('build', (t) => {
    t.is(fakeit.build().schema, 'base')
  })
  test('fakeit', (t) => {
    t.is(fakeit().schema, 'base')
  })
  test('after', (t) => {
    t.is(fakeit.after().schema, 'base')
  })
  test('odds', (t) => {
    t.is(fakeit.odds().schema, 'base')
  })
})

//
//
// test.skip('testing', (t) => {
//   const details = fakeit.object({
//     prefix: fakeit((t) => t.$chance.prefix()).odds(5),
//     first_name: fakeit.build((t) => t.$faker.name.firstName()),
//     middle_name: fakeit((t) => t.$chance.name({ middle: true }).split(' ')[1]).odds(70),
//     last_name: fakeit((t) => t.$faker.name.lastName()).odds(70),
//     company: fakeit.build((t) => t.$faker.company.companyName()).odds(30),
//     job_title: fakeit.build((t) => t.$faker.name.jobTitle()).odds(30),
//     dob: fakeit.build((t) => new Date(t.$faker.date.past()).toISOString().split('T')[0]).odds(),
//     nickname: fakeit.build((t) => t.$faker.random.word()).odds(10),
//   })
//
//   const actual = fakeit
//     .options({
//       name: 'Contacts',
//       key: '_id',
//       min: 1,
//       max: 4,
//       before () {}, // before any documents get generated
//       beforeEach () {}, // before
//     })
//     .object({
//       _id: fakeit.after((t) => `contact_${t.document.contact_id}`),
//       doc_type: 'contact',
//       channels: [ 'ufp-555555555' ],
//       contact_id: fakeit.build((t) => t.$chance.guid()),
//       created_on: fakeit.build((t) => new Date(t.$faker.date.past()).getTime()),
//       modified_on: fakeit.build((t) => new Date(t.$faker.date.recent()).getTime()),
//       foo: fakeit
//         .array()
//         .items(fakeit((t) => t.$faker))
//         .min(1)
//         .max(10),
//       details,
//     })
//
//   console.log('actual:', actual.inner.value._id)
//
//   t.pass()
// })
