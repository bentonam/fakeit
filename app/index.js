import Input from './input';
import Models from './models';
import * as output from './output';
import Base from './base';
import to from 'to-js';
import mixin from 'class-mixin';

/// @name Fakeit
/// @page api
/// @description
/// This class is used to generate fake data in `json`, `cson`, `csv`, `yml`, `yaml` formats.
/// You can have it output idividual files or you can connect to a data base and store the files there.
/// @arg {object} options [{}] Here are the defaults
/// ```
/// options = {
///   archive: '',
///   output: 'console',
///   models: process.cwd(),
///   destination: 'console',
///   format: 2,
///   server: '127.0.0.1',
///   bucket: 'default',
///   // Base options
///   root: process.cwd(),
///   // default options for the logger
///   log: true,
///   verbose: false,
///   timestamp: true,
/// }
/// ```
export default class Fakeit extends mixin(Base, Input, Models) {
  constructor(options = {}) {
    // console.log(this);
    options = to.extend({
      archive: '', ///# @todo move option to `Fakeit.prototype.output`
      output: 'console', ///# @todo figure out if this is the output type (aka `json`, `cson`, `csv`, `yml`, `yaml`)
      models: process.cwd(), ///# @todo rename `options.models` to be `options.keywords`
      destination: 'console', ///# @todo move option to `Fakeit.prototype.output`
      server: '127.0.0.1', ///# @todo try to move this to `Fakeit.prototype.output` options
      bucket: 'default', ///# @todo try to move this to `Fakeit.prototype.output` options

      // defined in `input.js` and used in `models.js` and `documents.js`
      inputs: '', ///# @todo remove

      exclude: '', ///# @todo remove

      // used by `models.js` only
      number: null, ///# @todo rename `options.number` to be `options.count`
      count: null,

      // Base options
      format: 2, ///# @todo rename `options.format` to be `options.spacing`
      spacing: 2, // the spacing to use when objects are converted to other languanges
      root: process.cwd(), // the root folder to work from
      // options for the logger
      log: true,
      verbose: false,
      timestamp: true,
    }, options);
    super(options);
    this.options = options;

    // defined in `input.js`
    this.inputs = {};

    // defined in `model.js`
    this.models = {}; // holds the parsed models
    this.model_order = []; // holds the order that the models should run in
  }

  generate() {
    return new Promise(async (resolve, reject) => {
      try {
        this.resolve = resolve;
        this.reject = reject;

        if (this.options.input) {
          await this.input(this.options.input);
        }

        await this.registerModel(this.options.models);

        // @todo remove this, It's only used in output
        const model_documents_count = to.keys(this.models).reduce((prev, next) => {
          next = this.models[next];
          prev[next.name] = next.count;
          return prev;
        }, {});

        await output.prepare(this.options, resolve, reject, model_documents_count);

        await this.generateModels();
      } catch (err) {
        console.log(err);
        try {
          output.errorCleanup();
        } finally {
          reject(err);
        }
      }
    });
  }
}

// @todo incorporate these validations into the different functions of this app
// function validate(options) {
//   if ('json,cson,csv,yml,yaml'.indexOf(options.output) === -1) { // validate output format
//     throw new Error('Unsupported output type');
//   } else if (
//     options.archive &&
//     path.extname(options.archive) !== '.zip'
//   ) { // validate archive format
//     throw new Error('The archive must be a zip file');
//   } else if (
//     options.destination === 'couchbase' && (
//       !options.server ||
//       !options.bucket
//     )
//   ) { // validate couchbase
//     throw new Error('For the server and bucket must be specified when outputting to Couchbase');
//   } else if (
//     options.destination === 'couchbase' &&
//     options.archive
//   ) { // validate couchbase
//     throw new Error('The archive option cannot be used when the output is couchbase');
//   }
// }
