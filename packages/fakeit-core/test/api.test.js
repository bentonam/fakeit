import ava from 'ava-spec'
import caporal from 'caporal'
import path from 'path'

import Api from '../src/api'

const test = ava.group('api')

test.beforeEach((t) => {
  t.context = new Api({ root: path.join(__dirname, 'fixtures', 'api') })
})

test('settings', (t) => {
  t.snapshot(t.context.settings)
  t.snapshot(t.context.config)
  t.deepEqual(t.context.settings, t.context.config.settings)
})

test.group('loadConfig error', (test) => {
  const root = path.join(__dirname, 'fixtures', 'api-errors')
  test('fakeitfile.js', (t) => {
    function woohoo () {
      throw new Error('this is an error inside of a fakeitfile.js')
    }
    const error = t.throws(() => new Api({ root, plugins: [ woohoo ] }))

    t.snapshot(error.message)
  })

  test('./some-plugin.js', (t) => {
    const error = t.throws(() => new Api({ root, plugins: [ './some-plugin.js' ] }))
    t.snapshot(error.message)
  })
})

test.group('options', (test) => {
  test('default arg', (t) => {
    t.notThrows(() => t.context.options())
  })
  test('valid', (t) => {
    const api = t.context

    Object.assign(api.settings, {
      woohoo: {
        awesome: 1000,
      },
    })

    t.is(api.settings.woohoo.awesome, 1000)

    api.config.options('woohoo.awesome', () => 2000)

    api.options({ woohoo: 'this should never get set' })

    t.not(api.settings.woohoo, 'this should never get set')
    t.is(api.settings.woohoo.awesome, 2000)
  })

  test('plugins not allowed', (t) => {
    const error = t.throws(() => t.context.options({ plugins: [] }))

    t.snapshot(error.message)
  })
})

test('runCli', async (t) => {
  // this is tested more in `config.test.js`
  await t.notThrows(() => t.context.runCli(caporal))
})

test('runPlugins', (t) => {
  // this is tested more in `config.test.js`
  t.notThrows(() => t.context.runPlugins())
})
