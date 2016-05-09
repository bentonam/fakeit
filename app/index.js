'use strict';

import program from 'commander';
import generator from './generator';

export default function() {
  // get the inputs
  program
    .version('0.0.1')
    .usage('data-generator [options]')
    .option('-o, --output [value]', 'The output to generate.  Supported formats are: json, csv, yaml', 'json')
    .option('-a, --archive [value]', '(optional) The archive file to generate.  Supported formats are: zip')
    .option('-m, --models [value]', '(optional) A comma-delimited list of models to use', process.cwd())
    .option('-d, --destination [value]', '(optional) The output destination.  Values can be a "console" or a valid directory path.', process.cwd())
    .option('-f, --format [value]', '(optional) The spacing format to use for JSON and YAML file generation.  Default is 2', 2)
    .option('-n, --number [value]', '(optional) Overrides the number of documents to generate specified by the model.')
    .option('-i, --input [value]', '(optional) A directory of files or file to use as inputs.  Support formats are: json, yaml, csv')
    .parse(process.argv);

  // run the program
  generator
    .start(program)
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
