import ava from 'ava-spec'
import plugin from '../dist/index.js'

const { yaml } = plugin.parsers

const test = ava.group('@fakeit/format-yaml')

const str = `-
  id: 302672
  stuff:
    code: AD
    name: Andorra
    continent: EU`

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
  const actual = await yaml.parse(str)
  t.deepEqual(obj, actual)
})

test('stringify', async (t) => {
  const actual = await yaml.stringify(obj)
  t.deepEqual(str, actual)
})
