'use strict';

import program from 'commander';
import generator from './generator';
import { version } from './../package.json';

export default function() {
  // get the inputs
  program
    .version(version)
    .usage('fakeit [options]')
    .option('-o, --output [value]', 'The output format to generate.  Supported formats are: json, csv, yaml, cson', 'json')
    .option('-a, --archive [value]', 'The archive file to generate.  Supported formats are: zip')
    .option('-m, --models [value]', 'A directory or comma-delimited list of files models to use.', process.cwd())
    .option('-d, --destination [value]', 'The output destination.  Values can be: couchbase, console or a directory path.', process.cwd())
    .option('-f, --format [value]', 'The spacing format to use for JSON and YAML file generation.  Default is 2', 2)
    .option('-n, --number [value]', 'Overrides the number of documents to generate specified by the model.')
    .option('-i, --input [value]', 'Directory or comma-delimited list of files to use as inputs.  Support formats are: json, yaml, csv, cson, zip')
    .option('-s, --server [address]', 'Couchbase Server or Sync-Gateway address', '127.0.0.1')
    .option('-b, --bucket [name]', 'The name of a Couchbase Bucket.  The default value is: default', 'default')
    .option('-p, --password [value]', 'Bucket password')
    .option('-t, --timeout [value]', 'A timeout value for database operations', 5000)
    .option('-l, --limit [value]', 'Limit the number of save operations at a time.  Default: 100', 100)
    .option('-g, --sync_gateway_admin [value]', 'The Sync-Gateway Admin address')
    .option('-u, --username [name]', 'The sync-gateway username')
    .option('-e, --exclude [model]', 'A comma-delimited list of model names to exclude from output', '')
    .parse(process.argv);

  // run the program
  generator(program)
    .then(() => {
      // console.log('Data Generation Complete');
      process.exit();
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

process.on('uncaughtException', (err) => {
  console.error('An uncaughtException was found:', err.stack);
  process.exit(1);
});
