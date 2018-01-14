import Models from './models';
import Output from './output/index';
import Base from './base';
import to from 'to-js';
import { uniqueId } from 'lodash';
import Documents from './documents';
import DocumentsStream from './documents-stream';
import { success } from 'log-symbols';

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
///   seed: 0,
///   babel_config: '+(.babelrc|package.json)',
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
  }

  async generate(models, output_options = {}) {
    if (to.type(models) === 'object') {
      output_options = models;
      models = models.models;
    }

    if (!models) {
      return;
    }
    const label = uniqueId('fakeit');
    this.time(label);
    const model = new Models(this.options);

    const output = new Output(this.options, output_options);
    output.prepare();

    await model.registerModels(models);
    // calculate the total # of dependencies, if it is 0 and we're using Couchbase,
    // we can leverage streams to output the data.
    let total_dependants = 0;
    model.models.forEach((value) => {
      total_dependants += value.dependants.length;
    });
    await output.preparing;

    // @todo add additional check for cli argument, as using streams as it could introduce unexpected behavior
    // and some features might not be available
    if (output_options.output === 'couchbase' && !total_dependants) { // we're outtputting to couchbase and there aren't any dependants use streams
      const documents = new DocumentsStream(
        this.options,
        this.globals,
        model.inputs,
        output,
      );
      delete model.inputs;
      let result = await documents.build(model.models);
      await output.finalize();
      const time = this.timeEnd(label);
      if (this.options.verbose) {
        console.log(`${success} Finished generating ${documents.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} documents in ${time}`);
      }
      return result;
    } else {
      const documents = new Documents(this.options, this.documents, this.globals, model.inputs);
      delete model.inputs;
      let result = documents.build(model.models);
      documents.on('data', (data) => output.output(data));
      result = await result;
      await output.finalize();
      const time = this.timeEnd(label);
      if (this.options.verbose) {
        console.log(`${success} Finished generating ${documents.total} documents in ${time}`);
      }
      return result;
    }
  }
}
