import { map } from 'async-array-methods';
import fs from 'fs-extra-promisify';
import path from 'path';
import DependencyResolver from 'dependency-resolver';
import * as utils from './utils';
import Base from './base';
import { set, get } from 'lodash';
import to, { is } from 'to-js';
import { transform } from 'babel-core';
import globby from 'globby';

export default class Models extends Base {
  constructor(options = {}) {
    super(to.extend({
      babel_config: '+(.babelrc|package.json)',
    }, options));
    // holds all the inputs that are registerd
    this.inputs = {};

    this.models = []; // holds the parsed models

    this.prepared = false;
  }

  ///# @name prepare
  ///# @description
  ///# This is used to prepare the saving functionality that is determined by the
  ///# options that were passed to the constructor.
  ///# It sets a variable of `this.preparing` that ultimately calls `this.setup` that returns a promise.
  ///# This way when you go to save data it, that function will know if the setup is complete or not and
  ///# wait for it to be done before it starts saving data.
  ///# @returns {promise} - The setup function that was called
  ///# @async
  prepare() {
    this.preparing = true;
    this.preparing = this.setup();
    return this.preparing;
  }

  ///# @name setup
  ///# @description
  ///# This is used to setup the saving function that will be used.
  ///# @async
  async setup() {
    // if this.prepare hasn't been called then run it first.
    if (this.preparing == null) {
      return this.prepare();
    }

    let { babel_config } = this.options;

    if (!is.string(babel_config)) return;

    const dir = path.join(__dirname.split('node_modules')[0], '..');
    let file = await globby(this.resolvePaths(babel_config, dir), { dot: true });
    file = file[0];
    let config = await fs.readJson(file);
    if (file.includes('package')) {
      config = config.babelConfig || {};
    }
    this.options.babel_config = config;
    this.prepared = true;
  }

  async registerModels(models) {
    // if models weren't passed in then don't do anything
    if (!models) {
      return;
    }

    /* istanbul ignore if */
    if (this.prepared !== true) {
      if (this.preparing == null) {
        this.prepare();
      }
      await this.preparing;
    }

    this.options.babel_config = await this.options.babel_config;

    // get list of files
    let files = await utils.findFiles(this.resolvePaths(models));
    // flattens the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
    files = to.flatten(files).filter((file) => !!file && /\.ya?ml$/i.test(file));

    if (!files.length) throw new Error('No valid model files found.');

    this.models = await map(files, async (file) => {
      // read yaml file and convert it to json
      const model = await utils.parsers.yaml.parse(to.string(await fs.readFile(file)));

      if (!model.name) {
        model.name = path.basename(file).split('.')[0];
      }

      // validate the model
      if (!model.type) {
        this.log('error', new Error(`The model ${model.name} must have a "type" property.`));
      }
      if (!model.key) {
        this.log('error', new Error(`The model ${model.name} must have a "key" property.`));
      }

      // add the parsed model to the global object should always have a model name
      return this.parseModel(model, file);
    });

    // update the models order
    this.models = resolveDependenciesOrder(this.models);

    return this;
  }

  ///# @name parseModel
  ///# @description
  ///# This is used to parse the model that was passed and add the functions, and fix the types, data, and defaults
  ///# @returns {object} - The model that's been updated
  async parseModel(model, file) {
    const root = path.resolve(this.options.root, path.dirname(file));
    // resolve the input paths
    model.data.inputs = this.resolvePaths(model.data.inputs, root);
    const inputs = parseModelInputs(model, file);
    parseModelFunctions(model, this.options.babel_config);
    parseModelReferences(model);
    parseModelTypes(model);
    parseModelDefaults(model);
    parseModelCount(model, this.options.count);

    // add this models inputs to the main inputs object
    this.inputs = to.extend(this.inputs || {}, await inputs);

    return model;
  }
}


/// @name parseModelInputs
/// @description
/// This is used to parse files that are used to generate specific data
/// @arg {object} model - The model to parse
/// @returns {object}
/// @async
/// @note {5} The `model.data.input` paths must already be resolved to be a absolute path.
export async function parseModelInputs(model, current_file) {
  if (
    !model.data.inputs ||
    !model.data.inputs.length
  ) {
    model.data.inputs = {};
    return {};
  }

  const inputs = {};

  // get list of files, flatten the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
  let files = to.flatten(await utils.findFiles(model.data.inputs))
   .filter((file) => !!file && /\.(csv|json|cson|ya?ml|zip)$/i.test(file));

  if (!files.length) throw new Error(`No valid input files found for ${current_file}`);

  // loop over all the files, read them and parse them if needed
  files = await utils.readFiles(files);

  // handles parsing each of the supported formats
  await map(files, async (file) => {
    // get the current parser to use
    const parser = utils.parsers[file.ext.replace(/^\./, '')];

    if (!parser) throw new Error(`No valid parser could be found for "${file.name}.${file.type}"`);

    inputs[file.name] = await parser.parse(file.content);
    return file;
  });

  model.data.inputs = inputs;
  return inputs;
}

/// @name parseModelFunctions
/// @description
/// searches the model for any of the pre / post run and build functions and generates them
/// @arg {object} model - The model to update
/// @arg {string, object} babel_config [{}] - The configuration to use for babel
export function parseModelFunctions(model, babel_config = {}) {
  // console.log('models.parseModelFunctions');
  const paths = utils.objectSearch(model, /((pre|post)_run)|(pre_|post_)?build$/);
  paths.forEach((function_path) => {
    let name;
    try {
      name = to.camelCase(function_path);
    } catch (e) {
      name = function_path.split('.').pop();
    }

    // get the function
    let fn = get(model, function_path).trim().split('\n').filter(Boolean);

    // if it's a single line function then ensure that the value is returned
    // just like normal es6 arrow functions
    if (fn.length === 1) {
      fn = [ `return ${fn[0].replace(/^return\s+/, '')}` ];
    }

    // indent each line and create a string
    fn = fn.map((line) => `  ${line}`).filter(Boolean).join('\n');

    // wrap the users function in the function we're going to use to trigger their function
    fn = `function __result(documents, globals, inputs, faker, chance, document_index) {\n${fn}\n}`;

    // if a babel config exists then transform the function
    if (
      is.plainObject(babel_config) &&
      !is.empty(babel_config)
    ) {
      try {
        // transform the function and remove the `'use strict';\n` part that babel adds if it exists
        fn = transform(fn, babel_config).code.replace(/^.use strict.;\n+/, '');
      } catch (e) {
        const file_message = model.file ? ` in ${model.file}` : '';
        e.message = `Failed to transpile ${function_path} with babel${file_message}\n${e.message}`.trim();
        throw e;
      }
    }

    // create the main function that will be run.
    /* eslint-disable indent */
    fn = [
      `function ${name}(_documents, _globals, _inputs, _faker, _chance, _document_index) {`,
        // indent each line and create a string
        fn.split('\n').map((line) => `  ${line}`).filter(Boolean).join('\n'),
        '  return __result.apply(this, [].slice.call(arguments));',
      '}'
    ].join('\n');
    /* eslint-enable indent */

    try {
      set(model, function_path, new Function(`return ${fn}`)()); // eslint-disable-line no-new-func
    } catch (e) {
      throw new Error(`Function Error in model '${model.name}', for property: ${function_path}, Reason: ${e.message}`);
    }
  });
}

/// @name parseModelReferences
/// @description
/// searches the model for any '$ref' values that are pointing to definitions,
/// sub_models, etc. and copies the reference to the schema
/// @arg {object} model - The model to update
export function parseModelReferences(model) {
  // console.log('models.parseModelReferences');
  const pattern = /\.(schema|items).\$ref$/;
  // sort the array so definitions come first before properties, this allows definitions to have definitions
  const paths = utils.objectSearch(model, pattern).sort();
  for (let ref of paths) {
    let set_location = ref.replace(pattern, '');
    if (ref.includes('.items.')) {
      set_location += '.items';
    }
    const original_property = get(model, set_location);
    const get_location = get(model, ref).replace(/^#\//, '').replace('/', '.');
    const updated_property = to.extend(to.clone(original_property), get(model, get_location));
    set(model, set_location, updated_property);
  }
}

/// @name parseModelTypes
/// @description
/// Searches the model for any properties or items and makes
/// sure the default types exist
/// @arg {object} model - The model to update
export function parseModelTypes(model) {
  // console.log('models.parseModel_properties');
  for (let type_path of utils.objectSearch(model, /.*properties\.[^.]+(\.items)?$/)) {
    // console.log(type_path);
    const property = get(model, type_path);
    // make sure there is a type property set
    if (property.type == null) {
      property.type = 'null';
      set(model, type_path, property);
    }
  }
}

// sets any model defaults that are not defined
export function parseModelDefaults(model) {
  // console.log('models.parseModelDefaults');
  // find properties or items that do not have a data block and assign it
  utils.objectSearch(model, /^(.*properties\.[^.]+)$/)
    .forEach((data_path) => {
      let property = get(model, data_path);
      // if the property is an array that has an items block but not a data block, default it
      if (property.type === 'array') {
        if (property.items && !property.items.data) {
          property.items.data = {};
        }
      } else if (!property.data) {
        property.data = {};
      }
      set(model, data_path, property);
    });

  // find any data property at the root or that is a child of items and make sure it has the defaults for min, max, fixed
  if (!model.data) { // if a data property wasn't set define it
    model.data = {};
  }

  for (let data_path of utils.objectSearch(model, /^(.*properties\.[^.]+\.items\.data|(data))$/)) {
    set(
      model,
      data_path,
      to.extend({ min: 0, max: 0, fixed: 0 }, get(model, data_path))
    );
  }
}

export function parseModelCount(model, count) {
  if (!count) {
    count = model.data.fixed || to.random(model.data.min, model.data.max) || 1;
  }
  model.count = to.number(count);
}

export function resolveDependenciesOrder(models = []) {
  const resolver = new DependencyResolver();
  const order = {};

  for (let [ i, { name, data } ] of to.entries(models)) {
    order[name] = i;
    resolver.add(name);
    const dependencies = to.array(data && data.dependencies);
    for (let dependency of dependencies) {
      resolver.setDependency(name, dependency);
    }
  }

  return resolver.sort().map((name) => models[order[name]]);
}
