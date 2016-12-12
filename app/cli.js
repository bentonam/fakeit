import program from 'commander';
import Fakeit from './index.js';
import updateNotifier from 'update-notifier';
import pkg from './../package.json';
import { pick, omit } from 'lodash';
import chalk from 'chalk';
import to from 'to-js';

export default async function() {
  // check for update and notify
  updateNotifier({ pkg }).notify();

  // const deprecated = chalk.red('[DEPRECATED]:');

  // get the inputs
  program
    .version(pkg.version)
    .usage('fakeit [options]')

    // @todo change this option to be `--format`
    .option('-o, --output [value]', `The output format to generate. Supported formats: ${code('json', 'csv', 'yaml', 'yml', 'cson')}. (${dim('json')})`, 'json') // eslint-disable-line max-len

    // @todo change this option to a file path and determin the type based off the extention.
    .option('-a, --archive [value]', 'The archive file to generate. Supported formats are: zip')

    // @todo change this option to be the last argument passed to `fakeit`
    .option('-m, --models [value]', `A directory or comma-delimited list of files models to use. (${dim(process.cwd())})`, process.cwd())

    // @todo change this option to `--output`
    .option('-d, --destination [value]', `The output destination. Supported values: ${code('couchbase', 'sync-gateway', 'console')} or a ${code('directory path')}. (${dim('console')})`, 'console') // eslint-disable-line max-len

    // @todo change this option to be `-n`
    .option('-f, --spacing [value]', `The spacing format to use for JSON and YAML file generation. ${code('2')}`, 2)

    // @todo change this option to be `--count`
    .option('-n, --number [value]', 'Overrides the number of documents to generate specified by the model.')

    // @todo deprecate this option after the `input` has moved to the model layer.
    .option('-i, --input [value]', `List of globs to use as inputs. Support formats are: ${code('json', 'yaml', 'yml', 'csv', 'cson', 'zip')}`)

    // @todo move these option to `fakeit serve` or `fakeit server`.
    .option('-s, --server [address]', `Couchbase Server or Sync-Gateway address. (${dim('127.0.0.1')})`, '127.0.0.1')
    .option('-b, --bucket [name]', `The name of a Couchbase Bucket. (${dim('default')})`, 'default')
    .option('-p, --password [value]', 'Bucket password')
    .option('-u, --username [name]', 'The sync-gateway username')

    .option('-t, --timeout [value]', 'A timeout value for database operations', 5000)
    .option('-l, --limit [value]', `Limit the number of save operations at a time. (${dim('100')})`, 100)
    .option('-v, --verbose', 'Whether or not to use verbose output')

    // @todo deprecate this option after the way models are parsed has been updated to automatically include other dependencies.
    .option('-e, --exclude [model]', 'A comma-delimited list of model names to exclude from output', '')
    .parse(process.argv);


  let output_options = [
    'spacing',
    'output',
    'server',
    'bucket',
    'password',
    'username',
    'destination',
    'archive',
  ];
  const options = omit(program, output_options);
  output_options = pick(program, output_options);

  const fakeit = new Fakeit(options);
  try {
    await fakeit.generate(program.models, output_options);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  console.error('An uncaughtException was found:', err);
  process.exit(1);
});

export function code(...args) {
  return to.flatten(args).map((str) => chalk.bold(str)).join(', ');
}

export function dim(...args) {
  return to.flatten(args).map((str) => chalk.dim(str)).join(', ');
}
