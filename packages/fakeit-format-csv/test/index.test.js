import ava from 'ava-spec'
import plugin from '../dist/index.js'

const { csv } = plugin.parsers

const test = ava.group('@fakeit/format-csv')

const str = '"id","stuff"\n302672,"{""code"":""AD"",""name"":""Andorra"",""continent"":""EU""}"'

const obj = [
  {
    id: 302672,
    stuff: { code: 'AD', name: 'Andorra', continent: 'EU' },
  },
]

test('parse', async (t) => {
  const actual = await csv.parse(str)
  t.deepEqual(obj, actual)
})

test('stringify', async (t) => {
  const actual = await csv.stringify(obj)
  t.deepEqual(str, actual)
})
