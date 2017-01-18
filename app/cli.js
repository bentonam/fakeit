import commander from 'commander';
import Fakeit from './index.js';
import updateNotifier from 'update-notifier';
import pkg from './../package.json';
import path from 'path';
import { extend, flattenDeep, pick } from 'lodash';
import chalk from 'chalk';

export default async function() {
  // check for update and notify
  updateNotifier({ pkg }).notify();
  const base_options = [
    'root',
    'babel',
    'count',
    'verbose',
    'log',
    'spinners',
    'timestamp',
    'seed',
  ];

  const output_options = [
    // global options
    'format',
    'spacing',
    'limit',
    // action specific options
    'highlight',
    'archive',
    'server',
    'bucket',
    'username',
    'password',
    'timeout',
    // gets set based off the command that's used
    'output',
  ];

  // get the inputs
  commander
    .version(pkg.version)
    .usage('[command] [<file|directory|glob> ...]')
    .option('--root <directory>', 'defines the root directory from which paths are resolve from', process.cwd())
    .option('--babel <glob>', 'the location to the babel config', '+(.babelrc|package.json)')
    .option('-c, --count <n>', 'Overrides the number of documents to generate specified by the model.', parseInt)
    .option('-v, --verbose', 'enables verbose logging mode')
    .option('-S, --no-spinners', 'disables progress spinners', false)
    .option('-L, --no-log', 'disables all logging except for errors', false)
    .option('-T, --no-timestamp', 'disables timestamps from logging output', false)
    // global output options
    .option('-f, --format <type>', `this determins the output format to use. Supported formats: ${code('json', 'csv', 'yaml', 'yml', 'cson')}. (${dim('json')})`, 'json') // eslint-disable-line
    .option('-n, --spacing', 'the number of spaces to use for indention', 2)
    .option('-l, --limit', 'limit how many files are output at a time', 100)
    .option('-x, --seed [seed]', 'The global seed to use for repeatable data', (seed) => {
      const number = parseInt(seed);

      if (number > 0) {
        return number;
      }
      return seed;
    });


  commander
    .command('console')
    .option('-h, --no-highlight', 'This turns off the cli-table when a csv format', Boolean, false)
    .description('outputs the result to the console')
    .action(async (...args) => {
      const { highlight } = args.pop();

      await run({ output: 'console', highlight });
    });

  function runServer(output) {
    /* istanbul ignore next : too difficult to test the servers via the cli */
    return async (...args) =>{
      const options = pick(args.pop(), [ 'server', 'bucket', 'username', 'password', 'timeout' ]);
      options.output = output;
      await run(options);
    };
  }

  commander
    .command('couchbase')
    .option('-s, --server', `The server address (${dim('127.0.0.1')})`)
    .option('-b, --bucket', `The bucket name (${dim('default')})`)
    .option('-u, --username', 'the username to use (optional)')
    .option('-p, --password', 'the password for the account (optional)')
    .option('-t, --timeout', `timeout for the servers (${dim(5000)})`)
    .description('This will output to couchbase')
    .action(runServer('couchbase'));

  commander
    .command('sync-gateway')
    .option('-s, --server', `The server address (${dim('127.0.0.1')})`)
    .option('-b, --bucket', `The bucket name (${dim('default')})`)
    .option('-u, --username', 'the username to use (optional)')
    .option('-p, --password', 'the password for the account (optional)')
    .option('-t, --timeout', 'timeout for the servers')
    .description('no idea')
    .action(runServer('sync-gateway'));

  commander
    .command('directory [<dir|file.zip>] [<models...>]')
    .alias('folder')
    .option('-a, --archive [file.zip]', 'If an archive file is passed then the data will be output as a zip file', '')
    .description('Output the file(s) into a directory')
    .action(async (output, models, { archive }) => {
      const parsed = path.parse(output);

      if (parsed.ext) {
        archive = parsed.base;
        output = parsed.dir || commander.root;
      }

      // update the commander args to be correct
      commander.args = process.argv.slice(4);
      await run({ archive, output });
    });


  commander
    .command('help')
    .action(() => {
      commander.help();
    });

  commander.parse(process.argv);

  if (!commander.args.length) {
    commander.help();
  }


  // this function is used as a helper to run the different actions
  async function run(output = {}, opts = {}) {
    output = typeof output === 'string' ? { output } : output;
    const models = commander.args.filter((str) => typeof str === 'string');

    opts = pick(extend(pick(commander, base_options), opts), base_options);
    opts.babel_config = opts.babel;
    delete opts.babel;

    output = extend(pick(commander, output_options), pick(output, output_options));

    const fakeit = new Fakeit(opts);
    if (!models.length) {
      fakeit.log('warning', 'you must pass in models to use');
      commander.help();
      return;
    }

    try {
      await fakeit.generate(models, output);
      process.exit();
    } catch (err) {
      process.exit(1);
      throw err;
    }
  }
}

/* istanbul ignore next : too hard to test */
process.on('uncaughtException', (err) => {
  console.log('An uncaughtException was found:', err);
  process.exit(1);
});

export function code(...args) {
  return flattenDeep(args).map((str) => chalk.bold(str)).join(', ');
}

export function dim(...args) {
  return flattenDeep(args).map((str) => chalk.dim(str)).join(', ');
}
