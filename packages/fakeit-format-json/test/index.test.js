import ava from 'ava-spec'
import plugin from '../dist/index.js'

const { json } = plugin.parsers

const test = ava.group('@fakeit/format-json')

const str = `[
  {
    "id": 302672,
    "stuff": {
      "code": "AD",
      "name": "Andorra",
      "continent": "EU"
    }
  }
]`

const obj = [
  {
    id: 302672,
    stuff: {
      code: 'AD',
      name: 'Andorra',
      continent: 'EU',
    },
  },
]

test('parse', async (t) => {
  const actual = await json.parse(str)
  t.deepEqual(obj, actual)
})

test('stringify', async (t) => {
  const actual = await json.stringify(obj)
  t.deepEqual(str, actual)
})
