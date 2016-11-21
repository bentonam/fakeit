import path from 'path';
import * as utils from './utils';
import { map } from 'async-array-methods';
import to from 'to-js';

// stores the current input files
let inputs = {};

// pre run setup / handle settings
export async function prepare(options) {
  if (!options.input) return;

  // get list of files
  let files = await map(options.input.split(/\s*,\s*/), (str) => !!path.extname(str) ? str : utils.findFiles(str));
  // flattens the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
  files = to.flatten(files).filter((file) => !!file && /\.(csv|json|cson|ya?ml|zip)$/i.test(file));

  if (!files.length) throw new Error('No valid input files found.');

  // loop over all the files, read them and parse them if needed
  files = await utils.readFiles(files);

  // handles parsing each of the supported formats
  return map(files, async (file) => {
    // get the current parser to use
    const parser = utils.parsers[file.ext.replace(/^\./, '')];

    if (!parser) throw new Error(`No valid parser could be found for "${file.name}.${file.type}"`);

    const result = await parser.parse(file.content);
    inputs[file.name] = result;
    return file;
  });
}

export function getInputs() {
  return inputs;
}
