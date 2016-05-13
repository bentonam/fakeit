'use strict';

import program from 'commander';
import generator from './generator';
import { version } from './../package.json';

export default function() {
  // get the inputs
  program
    .version(version)
    .usage('fakeit [options]')
    .option('-o, --output [value]', '(optional) The output format to generate.  Supported formats are: json, csv, yaml, cson', 'json')
    .option('-a, --archive [value]', '(optional) The archive file to generate.  Supported formats are: zip')
    .option('-m, --models [value]', '(optional) (optional) A directory or comma-delimited list of files models to use.', process.cwd())
    .option('-d, --destination [value]', '(optional) The output destination.  Values can be: couchbase, console or a directory path.', process.cwd())
    .option('-f, --format [value]', '(optional) The spacing format to use for JSON and YAML file generation.  Default is 2', 2)
    .option('-n, --number [value]', '(optional) Overrides the number of documents to generate specified by the model.')
    .option('-i, --input [value]', '(optional) A directory or comma-delimited list of files to use as inputs.  Support formats are: json, yaml, csv')
    .option('-s, --server [address]', '(optional) Couchbase Server or Sync-Gateway address', '127.0.0.1')
    .option('-b, --bucket [name]', '(optional) The name of a Couchbase Bucket.  The default value is: default', 'default')
    .option('-p, --password [value]', '(optional) Bucket password')
    .option('-t, --timeout [value]', '(optional) A timeout value for database operations', 5000)
    .option('-l, --limit [value]', '(optional) Limit the number of save operations at a time.  Default: 1000', 1000)
    .option('-g, --sync_gateway_admin [value]', '(optional) The sync-gateway admin address')
    .option('-u, --username [name]', '(optional) The sync-gateway username')
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
