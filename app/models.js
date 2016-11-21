import yaml from 'yamljs';
import { map } from 'async-array-methods';
import fs from 'fs-extra-promisify';
import path from 'path';
import documents from './documents';
import * as utils from './utils';
import objectPath from 'object-path';
import to from 'to-js';

let models = {}; // global variable to hold parsed models
let model_order = []; // global variable to hold the model run order
let model_dependencies = []; // global variable to hold all dependencies
let model_count = 0; // global variable to hold the number of available models
let model_documents_count = {}; // global variable to hold the number of documents to generate for each model
let settings; // global variable to hold the available options / settings

// pre run setup / handle settings
export async function prepare(options) {
  settings = options;
  if (!options.models) return;

  // get list of files
  let files = await map(options.models.split(/\s*,\s*/), (str) => !!path.extname(str) ? str : utils.findFiles(str));
  // flattens the array of files and filter files for valid input formats: csv, json, cson, yaml and zip
  files = to.flatten(files).filter((file) => !!file && /\.ya?ml$/i.test(file));

  if (!files.length) throw new Error('No valid model files found.');

  model_count = files.length;

  await map(files, parse);

  resolveDependencies();
  setDocumentCounts(options);
  return model_documents_count;
}

async function parse(file) {
  // read yaml file and convert it to json
  const model = yaml.parse(to.string(await fs.readFile(path.resolve(file))));

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


  // add the parsed model to the global object
  // should always have a model name
  models[model.name] = model;

  // console.log('models.parseModel');
  parseModelFunctions(model.name);
  parseModelReferences(model.name);
  parseModelTypes(model.name);
  parseModelDefaults(model.name);
}

// searches the model for any of the pre / post run and build functions and generates them
function parseModelFunctions(name) {
  const model = models[name];
  // console.log('models.parseModelFunctions');
  const results = utils.objectSearch(model, /((pre|post)_run)|(pre_|post_)?build$/);
  results.forEach((function_path) => {
    try {
      objectPath.set(
        model,
        function_path,
        /* eslint-disable no-new-func */
        new Function(
          'documents', 'globals', 'inputs', 'faker', 'chance', 'document_index',
          objectPath.get(model, function_path)
        )
        /* eslint-enable no-new-func */
      );
    } catch (e) {
      throw new Error(`Function Error in model '${model.name}', for property: ${function_path}, Reason: ${e.message}`);
    }
  });
}

// searches the model for any '$ref' values that are pointing to definitions, sub_models, etc. and copies the reference to the schema
function parseModelReferences(name) {
  const model = models[name];
  // console.log('models.parseModelReferences');
  const pattern = /\.(schema|items).\$ref$/;
  const results = utils.objectSearch(model, pattern);
  results.sort(); // sort the array so definitions come first before properties, this allows definitions to have definitions
  results.forEach((reference_path) => {
    const property_path = reference_path.replace(pattern, '') + (reference_path.indexOf('.items.') !== -1 ? '.items' : '');
    let property = objectPath.get(model, property_path);
    const defined_path = objectPath.get(model, reference_path).replace(/^#\//, '').replace('/', '.');
    property = to.extend(to.clone(property), objectPath.get(model, defined_path));
    objectPath.set(model, property_path, property);
  });
}

// searches the model for any properties or items and makes sure the defaults exist
function parseModelTypes(name) {
  const model = models[name];
  // console.log('models.parseModel_properties');
  const results = utils.objectSearch(model, /.*properties\.[^.]+(\.items)?$/);
  results.forEach((type_path) => {
    const property = objectPath.get(model, type_path);
    // make sure there is a type property set
    if (!property.hasOwnProperty('type')) {
      property.type = 'undefined';
      objectPath.set(model, type_path, property);
    }
  });
}

// sets any model defaults that are not defined
function parseModelDefaults(name) {
  const model = models[name];
  // console.log('models.parseModelDefaults');
  // find properties or items that do not have a data block and assign it
  let results = utils.objectSearch(model, /^(.*properties\.[^.]+)$/);
  results.forEach((data_path) => {
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
    models[name].data = model.data = {};
  }
  results = utils.objectSearch(model, /^(.*properties\.[^.]+\.items\.data|(data))$/);
  const data_defaults = { min: 0, max: 0, fixed: 0 };
  results.forEach((data_path) => {
    objectPath.set(
      model,
      data_path,
      to.extend(to.clone(data_defaults), objectPath.get(model, data_path))
    );
  });
}

// resolve the dependencies and establish the order the models should be parsed in
function resolveDependencies() {
  // console.log('models.resolveDependencies');
  let counter = 0;
  // continue looping until all dependencies are resolve or we have looped (model_count * 5) times at which point
  // not all dependencies could be resolved and we will just error to prevent an infinte loop
  while (
    counter < model_count * 5 &&
    model_order.length < model_count
  ) {
    counter += 1;
    for (let model in models) {
      // if there are dependencies, determine if all of the dependencies have already been added to the order
      if (
        models[model].data &&
        models[model].data.dependencies
      ) {
        if (checkDependencies(models[model].data.dependencies)) {
          addModelOrder(model);
        }
      } else { // there are no dependencies add it to the order
        addModelOrder(model);
      }
    }
  }
  if (model_order.length !== model_count) {
    // update error to include which models could not be resolved
    throw new Error(`The following Model Dependencies could not be resolved: ${unresolvableDependencies().join(', ')}`);
  }
  // console.log('Models will be generated in the following order: %s', model_order.join(', '));
}

// builds an array of all of the dependencies that could not be resolved
function unresolvableDependencies() {
  return model_dependencies.filter((v) => {
    return model_order.indexOf(v) === -1;
  });
}

// determines if all dependencies have been resolved or not
function checkDependencies(dependencies) {
  let resolved = 0;
  // loop over each of the models dependencies and check if its dependencies have been resolved
  for (let i = 0; i < dependencies.length; i++) {
    if (model_dependencies.indexOf(dependencies[i]) === -1) { // if the dependency has been added yet add it
      model_dependencies.push(dependencies[i]);
    }
    resolved += model_order.indexOf(dependencies[i]) !== -1 ? 1 : 0;
  }
  return resolved === dependencies.length;
}

// adds a model to the run order if it has not already been added
function addModelOrder(model) {
  if (model_order.indexOf(model) === -1) {
    model_order.push(model);
  }
  return;
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
