'use strict';

import program from 'commander';
import chalk from 'chalk';
import generator from './generator';

export default function() {
  // get the inputs
  program
    .version('0.0.1')
    .usage('generate [options]')
    .option('-m, --models [value]', 'The a space delimited list to the yaml models to generate')
    .option('-z, --zip [value]', 'The path to a zip file to save the generated data in')
    .option('-s, --server [address]', 'Server address', '127.0.0.1')
    .option('-b, --bucket [name]', 'Bucket name', 'default')
    .option('-p, --password [value]', 'Bucket password')
    .option('-l, --log_level [value]', 'Log Level to be used', '0')
    .parse(process.argv);
  // run the program
  generator
    .start(program)
    .then((documents_generated) => {
      console.log('%s documents were generated', documents_generated);
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
