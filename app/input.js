import Base from './base';
import * as utils from './utils';
import { map } from 'async-array-methods';
import to from 'to-js';

/// @name Input
/// @page api
/// @description
/// This is used to get all the input files and their contents
export default class Input extends Base {
  constructor(options = {}) {
    super(options);
    this.inputs = this.inputs || {};
  }

  ///# @name input
  ///# @description
  ///# This is used to parse files that are used to generate specific data
  ///# @arg {string, array} paths - The paths to the files that you wish to add data from.
  ///# @chainable
  ///# @async
  async input(paths) {
    if (!paths) {
      return this.log('error', 'You must pass paths to inputs');
    };

    // get list of files
    let files = await utils.findFiles(this.resolvePaths(paths));
    // flattens the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
    files = to.flatten(files).filter((file) => !!file && /\.(csv|json|cson|ya?ml|zip)$/i.test(file));

    if (!files.length) throw new Error('No valid input files found.');

    // loop over all the files, read them and parse them if needed
    files = await utils.readFiles(files);

    // handles parsing each of the supported formats
    await map(files, async (file) => {
      // get the current parser to use
      const parser = utils.parsers[file.ext.replace(/^\./, '')];

      if (!parser) throw new Error(`No valid parser could be found for "${file.name}.${file.type}"`);

      this.inputs[file.name] = await parser.parse(file.content);
      return file;
    });

    return this;
  }
}
