'use strict';

import program from 'commander';
import chalk from 'chalk';
import generator from './generator';

export default function() {
  // get the inputs
  program
    .version('0.0.1')
    .usage('data-generator [options]')
    .option('-o, --output [value]', 'The output to generate.  Supported formats are: json, csv, yaml')
    .option('-a, --archive [value]', 'The archive file to generate.  Supported formats are: zip')
    .option('-m, --models [value]', 'A comma-delimited list of models to use, by default all models in a directory are used.', process.cwd())
    .option('-d, --destination [value]', 'The output destination / directory.  Values can be a "console" or a valid directory path.', process.cwd())
    .option('-f, --format [value]', 'The spacing format to use for JSON and YAML file generation.  Default is 2', 2)
    .option('-n, --number [value]', 'Overrides the number of documents to generate specified by the model.')
    .option('-s, --server [address]', 'Server address', '127.0.0.1')
    .option('-b, --bucket [name]', 'Bucket name', 'default')
    .option('-p, --password [value]', 'Bucket password')
    .parse(process.argv);
  // run the program
  generator
    .start(program)
    .then(() => {
      // console.log('Data Generation Complete');
      process.exit();
    })
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
}

process.on('uncaughtException', (err) => {
  console.log(chalk.bold.bgRed.white('An uncaughtException was found:', err.stack));
  process.exit(1);
});
