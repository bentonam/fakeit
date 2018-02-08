import caporal from 'caporal'
import ava from 'ava-spec'

import Config from '../src/config'

const test = ava.group('config')

test.beforeEach((t) => {
  t.context = new Config()
})

test('settings', (t) => {
  t.snapshot(t.context)
})

test.group('plugin', (test) => {
  test('valid', (t) => {
    t.context.plugin('foo', () => {
      return 'foo is awesome'
    })

    t.is(typeof t.context.plugins.foo, 'function')
    // the dynamic plugins shouldn't be defined yet
    t.is(typeof t.context.$plugins.$foo, 'undefined')
  })

  test('invalid', (t) => {
    const name = t.throws(() => t.context.plugin(2123, () => 'woohoo'))
    const fn = t.throws(() => t.context.plugin('name', {}))
    t.snapshot(name)
    t.snapshot(fn)
  })
})

test('runPlugins', (t) => {
  Object.assign(t.context.settings, {
    spacing: 2,
  })
  t.context.plugin('foo', ({ spacing }) => spacing)

  t.context.runPlugins()

  t.is(typeof t.context.$plugins.foo, 'undefined')
  t.deepEqual(t.context.$plugins.$foo, 2)
})

test.group('format', () => {
  test('valid', (t) => {
    t.context.format('json', {
      parse () {},
      stringify () {},
    })

    t.is(typeof t.context.formats.json, 'object')
    t.is(typeof t.context.formats.json.parse, 'function')
    t.is(typeof t.context.formats.json.stringify, 'function')
  })

  test('invalid', (t) => {
    const ext = t.throws(() => t.context.format(100, () => {}))
    const ext_to_long = t.throws(() => t.context.format('jsonasdfasd', () => {}))
    const obj = t.throws(() => t.context.format('ext', () => {}))
    t.snapshot(ext)
    t.snapshot(ext_to_long)
    t.snapshot(obj)
  })
})

test.group('options', (test) => {
  test('valid', (t) => {
    Config.prototype.getPluginOptions = function getCliPlugins () {
      return this[Object.getOwnPropertySymbols(this)[1]]
    }
    const config = new Config({
      other_formats: {
        cson: {
          spacing: 12,
        },
      },
    })

    config.options('formats.json', () => ({ spacing: 2 }))
    const defined = { cson: { spacing: 2 } }
    config.options('other_formats', defined)

    config.runOptions()

    t.deepEqual(defined, { cson: { spacing: 2 } }, "the defined object shouldn't be modified")
    const plugin_options = config.getPluginOptions()
    t.deepEqual(Object.keys(plugin_options), [ 'formats.json', 'other_formats' ])
    t.is(typeof plugin_options['formats.json'], 'function')
    t.is(typeof plugin_options.other_formats, 'function')
    t.deepEqual(config.settings.formats, { json: { spacing: 2 } })
    t.deepEqual(config.settings.other_formats, { cson: { spacing: 12 } })
  })

  test('invalid', (t) => {
    Config.prototype.getPluginOptions = function getCliPlugins () {
      return this[Object.getOwnPropertySymbols(this)[1]]
    }
    const config = new Config()
    const name = t.throws(() => config.options(1123, () => ({ spacing: 2 })))
    const fn = t.throws(() => config.options('name', []))

    config.runOptions()

    t.snapshot(name)
    t.snapshot(fn)
    t.deepEqual(
      config.getPluginOptions(),
      {},
      'no options should exist because there were errors before they were set',
    )
    t.deepEqual(config.settings, {}, 'no settings were set')
  })
})

test.group('options/validate/joi/runOptions', (test) => {
  test('valid', (t) => {
    Object.assign(t.context.settings, {
      formats: {
        json: {
          spacing: '2',
        },
      },
    })

    t.context.options('formats.json', (options = {}) => {
      const { joi } = t.context
      options = t.context.validate(
        options,
        joi.object({
          spacing: joi.number(),
        }),
      )

      return Object.assign(
        {
          style: 'awesome',
        },
        options,
      )
    })

    t.context.runOptions()
    t.deepEqual(t.context.settings.formats, { json: { style: 'awesome', spacing: 2 } })
  })

  test('invalid', (t) => {
    Object.assign(t.context.settings, {
      formats: {
        json: {
          spacing: '    ',
        },
      },
    })

    t.context.options('formats.json', (options = {}) => {
      const { joi } = t.context
      options = t.context.validate(
        options,
        joi.object({
          spacing: joi.number(),
        }),
      )

      return Object.assign(
        {
          style: 'awesome',
        },
        options,
      )
    })

    const message = t.throws(() => t.context.runOptions())

    t.snapshot(message)
  })
})

test.group('cli', (test) => {
  test('valid', (t) => {
    Config.prototype.getCliPlugins = function getCliPlugins () {
      return this[Object.getOwnPropertySymbols(this)[0]]
    }
    const config = new Config()
    const fn = (cli) => {
      cli.command('awesome').action(() => {
        // do something awesome
      })
    }
    config.cli(fn)

    t.deepEqual(config.getCliPlugins(), [ fn ])
  })

  test('invalid', (t) => {
    Config.prototype.getCliPlugins = function getCliPlugins () {
      return this[Object.getOwnPropertySymbols(this)[0]]
    }
    const config = new Config()
    const fn = t.throws(() => config.cli({}))
    t.snapshot(fn)
    t.deepEqual(config.getCliPlugins(), [], 'no plugins should exist because there was an error')
  })
})

test.group('runCli', (test) => {
  test('valid', async (t) => {
    Config.prototype.getCliPlugins = function getCliPlugins () {
      return this[Object.getOwnPropertySymbols(this)[0]]
    }
    const config = new Config()
    config.cli((cli) => {
      cli.command('awesome').action(() => {
        // do something awesome
      })
    })

    await config.runCli(caporal)

    t.is(caporal._commands[0]._name, 'awesome')
  })

  test('invalid', (t) => {
    const message = t.throws(() => t.context.runCli())
    t.snapshot(message)
  })
})

test.group('processor', (test) => {
  test('valid', (t) => {
    t.context.processor('yaml', () => {
      // do something with the processor
    })

    t.deepEqual(Object.keys(t.context.processors), [ 'yaml' ])
    t.is(typeof t.context.processors.yaml, 'function')
  })

  test('invalid', (t) => {
    const ext = t.throws(() => t.context.processor('asdfasdfa'))
    const ext_number = t.throws(() => t.context.processor(1233))
    const fn = t.throws(() => t.context.processor('yaml', {}))

    t.snapshot(ext)
    t.snapshot(ext_number)
    t.snapshot(fn)

    t.deepEqual(
      t.context.processors,
      {},
      "there shouldn't be a processor because there was an error",
    )
  })
})

test.group('output', (test) => {
  test('valid', (t) => {
    t.context.output('couchbase', () => {
      // do something with the couchbase output
    })

    t.deepEqual(Object.keys(t.context.outputs), [ 'couchbase' ])
    t.is(typeof t.context.outputs.couchbase, 'function')
  })

  test('invalid', (t) => {
    const type = t.throws(() => t.context.output('aasdf_adsfasdf'))
    const fn = t.throws(() => t.context.output('abcd', {}))

    t.snapshot(type)
    t.snapshot(fn)

    t.deepEqual(t.context.outputs, {}, "there shouldn't be a output because there was an error")
  })
})
