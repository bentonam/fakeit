import Input from './input';
import Models from './models';
import { series } from 'async-array-methods';
import Output from './output/index';
import Base from './base';
import to from 'to-js';
import mixin from 'class-mixin';
import Document from './documents';

/// @name Fakeit
/// @page api
/// @description
/// This class is used to generate fake data in `json`, `cson`, `csv`, `yml`, `yaml` formats.
/// You can have it output idividual files or you can connect to a data base and store the files there.
/// @arg {object} options [{}] Here are the defaults
/// ```
/// options = {
///   inputs: '', // @todo remove
///   exclude: '', // @todo remove
///   // a fixed number of documents to generate
///   count: null,
///   // Base options
///   root: process.cwd(),
///   log: true,
///   verbose: false,
///   timestamp: true,
/// }
/// ```
/* istanbul ignore next: These are already tested in other files */
export default class Fakeit extends mixin(Base, Input, Models) {
  constructor(options = {}) {
    options = to.extend({
      // defined in `input.js` and used in `models.js` and `documents.js`
      inputs: '', ///# @todo remove

      exclude: '', ///# @todo remove

      // used by `models.js` only
      count: null,

      // Base options
      root: process.cwd(), // the root folder to work from

      // options for the logger
      log: true,
      verbose: false,
      timestamp: true,
    }, options);
    super(options);
    this.options = options;

    this.documents = {};
    this.globals = {};

    // defined in `input.js`
    this.inputs = {};

    // defined in `model.js`
    this.models = []; // holds the parsed models
  }

  async generate(models, output_options = {}) {
    if (to.type(models) === 'object') {
      output_options = models;
      models = models.models;
    }

    if (!models) {
      return;
    }

    const output = new Output(this.options, output_options);
    const preparing = output.prepare();

    // @todo remove this when we can resolve inputs and dependencies automatically
    if (this.options.input) {
      await this.input(this.options.input);
    }

    // @todo remove `this.options.models`
    await this.registerModels(models);

    const document = new Document(this.options, this.documents, this.globals, this.inputs);

    await preparing;

    const data = await series(to.flatten(this.models), async (model) => {
      return output.output(await document.build(model));
    });

    await output.finalize();

    return data;
  }
}
