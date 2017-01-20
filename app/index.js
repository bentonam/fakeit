import Models from './models';
import { map } from 'async-array-methods';
import Output from './output/index';
import Base from './base';
import to from 'to-js';
import { uniqueId } from 'lodash';
import Document from './documents';
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

    const document = new Document(this.options, this.documents, this.globals, model.inputs);

    let result = [];

    for (let obj of to.flatten(model.models)) {
      const value = await document.build(obj);
      if (!obj.is_dependency) {
        result.push(value);
      }
    }

    result = await Promise.all(result);

    await output.preparing;
    result = await map(result, (data) => output.output(data));
    await output.finalize();
    const time = this.timeEnd(label);
    const total = to.reduce(document.documents, (prev, { value }) => prev + value.length, 0);
    if (this.options.verbose) {
      console.log(`${success} Finished generating ${total} documents in ${time}`);
    }

    return result;
  }
}
