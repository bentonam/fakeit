'use strict';

import yaml from 'yamljs';
import path from 'path';
import fs from 'fs';
import documents from './documents';
import utils from './utils';
import objectMerge from 'object-merge';
import objectPath from 'object-path';

let models = {}; // global variable to hold parsed models
let model_order = []; // global variable to hold the model run order
let model_count = 0; // global variable to hold the number of available models

// pre run setup / handle settings
const prepare = (options) => {
  return list(options)
          .then(load)
          .then(validate)
          .then(parse)
          .then(resolve_dependencies);
};

// gets the available model yaml files from the current working directory
const list = (options) => new Promise((resolve, reject) => {
  // console.log('models.list');
  try {
    if (options.models) { // if models were passed from the command line use them
      let files = options.models.split(',').filter((file) => {
        return file.match(/\.ya?ml$/i);
      });
      if (!files.length) {
        reject('No models found');
      } else {
        resolve(files);
      }
    } else { // use the cwd directory to find the models
      fs.readdir(process.cwd(), (err, files) => {
        if (err) {
          throw err;
        } else {
          files = files.filter((file) => {
            return file.match(/\.ya?ml$/i);
          });
          if (!files.length) {
            reject('No models found');
          } else {
            resolve(files);
          }
        }
      });
    }
  } catch (e) {
    reject(e);
  }
});

// loop over all of the found yaml files and load them
const load = async (files) => {
  // console.log('models.load');
  let tmp = [];
  model_count = files.length;
  files.forEach((file) => {
    tmp.push(load_yaml_file(file));
  });
  return await Promise.all(tmp);
};

// load and conver a yaml file to a json object
const load_yaml_file = (file) => new Promise((resolve, reject) => {
  // console.log('models.load_yaml_file');
  yaml.load(path.resolve(file), (result) => {
    if (result) {
      models[result.name || file] = result; // add the parsed model to the global object
      resolve();
    } else {
      reject('Invalid YAML file');
    }
  });
});

const validate = async () => {
  // console.log('models.validate');
  for (let model in models) {
    if (!models[model].name) {
      throw new Error(`The model ${model} must have a "name" property.`);
    }
  }
};

// parse each of the model properties for a build functions
const parse = async () => {
  // console.log('models.parse');
  try {
    let parsed = [];
    for (let model in models) { // loop over each model
      if (models.hasOwnProperty(model)) {
        parsed.push(parse_model(model));
      }
    }
    return Promise.all(parsed);
  } catch (e) {
    console.log('Error: parse', e);
    throw e;
  }
};

const parse_model = async (model) => {
  // console.log('models.parse_model');
  await parse_model_functions(model);
  await parse_model_references(model);
};

// searches the model for any of the pre / post run and build functions and generates them
const parse_model_functions = async (model) => {
  // console.log('models.parse_model');
  let results = utils.object_search(models[model], /((pre|post)_run)|(pre_|post_)?build$/);
  results.forEach((function_path) => {
    objectPath.set(
      models[model],
      function_path,
      new Function(
        'documents', 'globals', 'faker', 'chance', 'current_document', 'current_value',
        objectPath.get(models[model], function_path)
      )
    );
  });
};

// searches the model for any '$ref' values that are pointing to definitions, sub_models, etc. and copies the reference to the schema
const parse_model_references = async (model) => {
  // console.log('models.parse_model');
  let pattern = /\.(schema|items).\$ref$/;
  let results = utils.object_search(models[model], pattern);
  results.forEach((reference_path) => {
    let property_path = reference_path.replace(pattern, '') + (reference_path.indexOf('.items.') !== -1 ? '.items' : '');
    let property = objectPath.get(models[model], property_path);
    let defined_path = objectPath.get(models[model], reference_path).replace(/^#\//, '').replace('/', '.');
    property = objectMerge({}, property, objectPath.get(models[model], defined_path));
    objectPath.set(models[model], property_path, property);
  });
};

// resolve the dependencies and establish the order the models should be parsed in
const resolve_dependencies = async () => {
  // console.log('models.resolve_dependencies');
  try {
    let counter = 0;
    // continue looping until all dependencies are resolve or we have looped (model_count * 5) times at which point
    // not all dependencies could be resolved and we will just error to prevent an infinte loop
    while (counter < model_count * 5 && model_order.length < model_count) {
      counter += 1;
      for (let model in models) {
        // if there are dependencies, determine if all of the dependencies have already been added to the order
        if (models[model].data.dependencies) {
          if (check_dependencies(models[model].data.dependencies)) {
            add_model_order(model);
          }
        } else { // there are no dependencies add it to the order
          add_model_order(model);
        }
      }
    }
    if (model_order.length !== model_count) {
      // update error to include which models could not be resolved
      throw new Error('Model dependencies could not be resolved.');
    } else {
      console.log('Models will be generated in the following order: %s', model_order.join(', '));
      return;
    }
  } catch (e) {
    throw new Error(`Error: resolve_dependencies ${e.message}`);
  }
};

// determines if all dependencies have been resolved or not
const check_dependencies = (dependencies) => {
  let resolved = 0;
  // loop over each of the models dependencies and check if its dependencies have been resolved
  for (let i = 0; i < dependencies.length; i++) {
    resolved += model_order.indexOf(dependencies[i]) !== -1 ? 1 : 0;
  }
  return resolved === dependencies.length;
};

// adds a model to the run order if it has not already been added
const add_model_order = (model) => {
  if (model_order.indexOf(model) === -1) {
    model_order.push(model);
  }
  return;
};

// handles generation of data for each model
const generate = async () => {
  // console.log('models.generate');
  for (let i = 0; i < model_order.length; i++) { // loop over each model and execute in order of dependency
    await documents.run(models[model_order[i]]); // eslint-disable-line babel/no-await-in-loop
  }
  return;
};

export default { prepare, generate };
