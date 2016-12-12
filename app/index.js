import Models from './models';
import { series } from 'async-array-methods';
import Output from './output/index';
import Base from './base';
import to from 'to-js';
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
export default class Fakeit extends Base {
  constructor(options = {}) {
    super(options);

    this.documents = {};
    this.globals = {};

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
    const model = new Models(this.options);
    const output = new Output(this.options, output_options);
    const preparing = output.prepare();

    // @todo remove `this.options.models`
    await model.registerModels(models);

    const document = new Document(this.options, this.documents, this.globals);

    await preparing;

    const data = await series(to.flatten(model.models), async (obj) => {
      return output.output(await document.build(obj));
    });

    await output.finalize();

    return data;
  }
}
