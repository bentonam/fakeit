// @flow
// @jsx h

import program from 'caporal'
import chalk from 'chalk'
import path from 'path'
import { h, render } from 'ink'
// flow is broken
// $FlowFixMe
import { FakeitError, Api } from '@fakeit/core'
import { findIndex } from 'lodash'
import { version, description } from '../package.json'
import Fakeit from './fakeit'

function customizeCaporal (): void {
  // add all the default options/arguments to every sub command
  // https://github.com/mattallty/Caporal.js/issues/96
  const default_cmd = program._commands[0]
  for (const cmd of program._commands.slice(1)) {
    cmd._options.push(...default_cmd._options)
    cmd._args.push(...default_cmd._args)
  }

  // customize the help section to be more helpful
  program._helper.__getUsage = program._helper._getUsage
  program._helper._getUsage = function _getUsage (cmd: string): string {
    const help = this.__getUsage(cmd)
      .split('\n')

    help.splice(
      2,
      1,
      `     ${chalk.italic(this._program.name() || this._program.bin())} <command> [options] [file|directory|glob...]`,
    )
    // replace the unhelpful usage section and add our own

    const index = findIndex(help, (line: string) => line.includes('--root'))

    help.splice(index, 0, ...[ '', `   ${chalk.bold('ROOT OPTIONS')}`, '' ])

    // The options section is empty so removes it
    if (index <= 6) {
      help.splice(index - 3, 3)
    }

    return help.join('\n')
  }
}

export default (async function cli (): Promise<program> {
  const api = new Api()
  const formats = Object.keys(api.config.formats)
  // this is just so that it's easier to read in the cli
  const shortroot = api.settings.root.replace(path.dirname(api.settings.root) + path.sep, '')

  program
    .version(version)
    .bin('fakeit')
    .argument('[models...]', 'The models to parse. It can be a file, directory, or a glob')
    .description(description)
    .option(
      '--root <directory>',
      'Sets root directory from which paths are resolve from',
      program.STRING,
      // this just shortens the filename to clean it up
      shortroot,
    )
    .option(
      '--count <n>',
      'Overrides the number of documents to generate specified by the model',
      program.INTEGER,
    )
    .option(
      '--format <type>',
      `this determines the output format to use. (${formats
        .map((str: string) => chalk.bold(str))
        .join(', ')})`,
      formats,
      api.settings.format,
    )
    // this doesn't work currently
    // .complete(() => formats)
    .option(
      '--spacing <n>',
      'the number of spaces to use for indention',
      program.INTEGER,
      api.settings.spacing,
    )
    .option(
      '--limit <n>',
      'limit how many documents are output at a time',
      program.INTEGER,
      api.settings.limit,
    )
    .option(
      '--threads <n>',
      'Set the number of threads you want to use',
      program.INTEGER,
      api.settings.threads,
    )
    .option(
      '--seed <seed>',
      'The global seed to use for repeatable data',
      (seed: number | string) => {
        const number = parseInt(seed, 10)

        if (number > 0 || seed === '0') {
          return number
        }
        return seed
      },
    )

  const run = (models: string[], options: Object): void => {
    if (options.root === shortroot) {
      delete options.root
    }

    // pass in the options
    api.options(options)

    const unmount = render(<Fakeit api={api} models={models} />)

    // the setTimeout is nessisary because of the throttled throttleSetState
    // that is used in the Fakeit component
    api.on('finished', () => setTimeout(unmount, 100))
  }

  // add any plugin cli commands
  await api.runCli(program, (output: string) => {
    return ({ models }: Object, options: Object) => {
      options.output = output

      run(models, options)
    }
  })

  // this fixes a few bugs with caporal
  customizeCaporal()

  // This will run the help section if someone runs `fakeit` without arguments
  program.action(({ models }: Object, options: Object) => {
    if (typeof api.settings.output === 'function' && api.settings.output.name === 'noop') {
      throw new FakeitError('to use a custom function `output` function you must add one to `fakeitfile.js`')
    }

    run(models, options)
  })

  return program
})

/* istanbul ignore next : too hard to test */
process.on('uncaughtException', (err) => {
  throw new FakeitError(err)
})
