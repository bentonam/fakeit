/* eslint-disable global-require, import/no-dynamic-require */

import commander from 'commander'
import chalk from 'chalk'
import { flattenDeep } from 'lodash'
import { plugins } from '@fakeit/core'

export function code (...args) {
  return flattenDeep(args)
    .map((str) => chalk.bold(str))
    .join(', ')
}

export function dim (...args) {
  return flattenDeep(args)
    .map((str) => chalk.dim(str))
    .join(', ')
}

export function cliPlugins (packages) {
  console.log(plugins)
  for (const pkg of packages) {
    try {
      console.log('trying...', pkg)
      // use the cli method if it was exported
      const { cli } = require(pkg)
      console.log('yup...', pkg)
      // call the cli method
      cli(commander, { code, dim })
      // regardless always attach our own action function last
      commander.commands[commander.commands.length - 1].action(() => {
        console.log(`Final FakeIt action command for ${pkg}`)
      })
    } catch (e) {
      // the package doesn't exist, that's fine
    }
  }
}

// this is not a function that is to be called by anything other
// than the `bin/fakeit` file in the project
export default function () {
  // get the inputs
  commander
    .version(1)
    .usage('[command] [<file|directory|glob> ...]')
    // these are all the base options across the different actions
    .option(
      '--root <directory>',
      `Defines the root directory from which paths are resolve from (${dim('process.cwd()')})`,
      process.cwd(),
    )
    .option(
      '--babel <glob>',
      `The location to the babel config (${dim('+(.babelrc|package.json)')})`,
      '+(.babelrc|package.json)',
    )
    .option(
      '-c, --count <n>',
      'Overrides the number of documents to generate specified by the model. Defaults to model defined count',
      parseInt,
    )
    .option('-v, --verbose', `Enables verbose logging mode (${dim(false)})`)
    .option('-S, --no-spinners', 'Disables progress spinners', false)
    .option('-L, --no-log', 'Disables all logging except for errors', false)
    .option('-T, --no-timestamp', 'Disables timestamps from logging output', false)
    // global output options
    .option(
      '-f, --format <type>',
      `this determines the output format to use. Supported formats: ${code(
        'json',
        'csv',
        'yaml',
        'yml',
        'cson',
      )}. (${dim('json')})`,
      'json',
    ) // eslint-disable-line
    .option('-n, --spacing <n>', `the number of spaces to use for indention (${dim('2')})`, 2)
    .option(
      '-l, --limit <n>',
      `limit how many files are output at a time (${dim('10')})`,
      Number,
      10,
    )
    .option('-x, --seed <seed>', 'The global seed to use for repeatable data', (seed) => {
      const number = parseInt(seed, 10)

      if (number > 0 || seed === '0') {
        return number
      }
      return seed
    })

  // attach plugin cli options (if any)
  cliPlugins(plugins)

  // i.e. `fakeit help`
  commander.command('help')
    .action(() => {
      commander.help()
    })

  commander.parse(process.argv)

  if (!commander.args.length) {
    commander.help()
  }
}

/* istanbul ignore next : too hard to test */
process.on('uncaughtException', (err) => {
  console.log('An uncaughtException was found:', err)
  process.exit(1)
})
