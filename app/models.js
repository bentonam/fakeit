import { map } from 'async-array-methods';
import fs from 'fs-extra-promisify';
import path from 'path';
import DependencyResolver from 'dependency-resolver';
import documents from './documents';
import * as utils from './utils';
import objectPath from 'object-path';
import to from 'to-js';

let models = {}; // global variable to hold parsed models
let model_order = []; // global variable to hold the model run order
let model_documents_count = {}; // global variable to hold the number of documents to generate for each model
let settings; // global variable to hold the available options / settings

// pre run setup / handle settings
// @todo remove this function
export async function prepare(options) {
  settings = options;
  if (!options.models) return;

  // get list of files
  let files = await map(options.models.split(/\s*,\s*/), (str) => !!path.extname(str) ? str : utils.findFiles(str));
  // flattens the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
  files = to.flatten(files).filter((file) => !!file && /\.ya?ml$/i.test(file));

  if (!files.length) throw new Error('No valid model files found.');

  await map(files, parse);

  model_order = resolveDependencies(models);
  setDocumentCounts(options);
  return model_documents_count;
}

// @todo remove this function
async function parse(file) {
  // read yaml file and convert it to json
  const model = await utils.parsers.yaml.parse(to.string(await fs.readFile(path.resolve(file))));

  if (!model.name) {
    model.name = file;
  }

  // validate the model
  if (!model.type) {
    throw new Error(`The model ${model.name} must have a "type" property.`);
  }
  if (!model.key) {
    throw new Error(`The model ${model.name} must have a "key" property.`);
  }

  // console.log('models.parseModel');
  parseModelFunctions(model);
  parseModelReferences(model);
  parseModelTypes(model);
  parseModelDefaults(model);

  // add the parsed model to the global object
  // should always have a model name
  models[model.name] = model;
}

// searches the model for any of the pre / post run and build functions and generates them
function parseModelFunctions(model) {
  // console.log('models.parseModelFunctions');
  const paths = utils.objectSearch(model, /((pre|post)_run)|(pre_|post_)?build$/);
  paths.forEach((function_path) => {
    try {
      objectPath.set(
        model,
        function_path,
        /* eslint-disable no-new-func */
        new Function('documents', 'globals', 'inputs', 'faker', 'chance', 'document_index', objectPath.get(model, function_path))
        /* eslint-enable no-new-func */
      );
    } catch (e) {
      throw new Error(`Function Error in model '${model.name}', for property: ${function_path}, Reason: ${e.message}`);
    }
  });
}

// searches the model for any '$ref' values that are pointing to definitions, sub_models, etc. and copies the reference to the schema
function parseModelReferences(model) {
  // console.log('models.parseModelReferences');
  const pattern = /\.(schema|items).\$ref$/;
  utils.objectSearch(model, pattern)
    .sort() // sort the array so definitions come first before properties, this allows definitions to have definitions
    .forEach((reference_path) => {
      const property_path = reference_path.replace(pattern, '') + (reference_path.includes('.items.') ? '.items' : '');
      let property = objectPath.get(model, property_path);
      const defined_path = objectPath.get(model, reference_path).replace(/^#\//, '').replace('/', '.');
      property = to.extend(to.clone(property), objectPath.get(model, defined_path));
      objectPath.set(model, property_path, property);
    });
}

// searches the model for any properties or items and makes sure the default types exist
function parseModelTypes(model) {
  // console.log('models.parseModel_properties');
  utils.objectSearch(model, /.*properties\.[^.]+(\.items)?$/)
    .forEach((type_path) => {
      const property = objectPath.get(model, type_path);
      // make sure there is a type property set
      if (!property.hasOwnProperty('type')) {
        property.type = 'undefined';
        objectPath.set(model, type_path, property);
      }
    });
}

// sets any model defaults that are not defined
function parseModelDefaults(model) {
  // console.log('models.parseModelDefaults');
  // find properties or items that do not have a data block and assign it
  utils.objectSearch(model, /^(.*properties\.[^.]+)$/)
    .forEach((data_path) => {
      let property = objectPath.get(model, data_path);
      // if the property is an array that has an items block but not a data block, default it
      if (property.type === 'array') {
        if (property.items && !property.items.data) {
          property.items.data = {};
        }
      } else if (!property.data) {
        property.data = {};
      }
      objectPath.set(model, data_path, property);
    });

  // find any data property at the root or that is a child of items and make sure it has the defaults for min, max, fixed
  if (!model.data) { // if a data property wasn't set define it
    model.data = {};
  }

  utils.objectSearch(model, /^(.*properties\.[^.]+\.items\.data|(data))$/)
    .forEach((data_path) => {
      objectPath.set(
        model,
        data_path,
        to.extend({ min: 0, max: 0, fixed: 0 }, objectPath.get(model, data_path))
      );
    });
}

function resolveDependencies(main_model = {}) {
  const resolver = new DependencyResolver();

  let keys = to.keys(main_model);
  for (let model_name of keys) {
    resolver.add(model_name);
    const dependencies = to.array(main_model[model_name].data && main_model[model_name].data.dependencies);
    for (let dependency of dependencies) {
      resolver.setDependency(model_name, dependency);
    }
  }

  return resolver.sort();
}

// resolve the dependencies and establish the order the models should be parsed in
export function getDocumentCounts() {
  return model_documents_count;
}

// resolve the dependencies and establish the order the models should be parsed in
async function setDocumentCounts() {
  // console.log('models.setDocumentCounts');
  model_order.forEach((v) => {
    let current_model = models[v];
    let number;
    if (settings.number) {
      number = parseInt(settings.number);
    } else {
      number = current_model.data.fixed || to.random(current_model.data.min, current_model.data.max) || 1;
    }
    model_documents_count[v] = number;
  });
  return model_documents_count;
}

// handles generation of data for each model
export async function generate(options) {
  // this has to run in order because other documents might depend on prior documents.
  for (let order of model_order) {
    await documents(// eslint-disable-line babel/no-await-in-loop
      models[order],
      model_documents_count[models[order].name],
      settings.number != null && parseInt(settings.number) > 0 && settings.exclude.indexOf(models[order].name) === -1,
      options
    ); // eslint-disable-line babel/no-await-in-loop
  }
}

// handles generation of data for each model
export function getModelNames() {
  return to.keys(models);
}
