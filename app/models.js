'use strict';

import yaml from 'yamljs';
import path from 'path';
import fs from 'fs';
import documents from './documents';

let models = {}; // global variable to hold parsed models
let model_order = []; // global variable to hold the model run order
let model_count = 0; // global variable to hold the number of available models

// pre run setup / handle settings
const prepare = () => {
  // console.log('models.prepare');
  return list()
          .then(load)
          .then(parse)
          .then(resolve_dependencies)
          .catch((err) => {
            console.log(err);
          });
};

// gets the available model yaml files from the current working directory
const list = () => new Promise((resolve, reject) => {
  // console.log('models.list');
  try {
    fs.readdir(process.cwd(), (err, files) => {
      if (err) {
        throw err;
      } else {
        files = files.filter((file) => {
          return file.match(/\.yaml$/i);
        });
        if (!files.length) {
          reject('No models found');
        } else {
          resolve(files);
        }
      }
    });
  } catch (e) {
    console.log('Error: get_models', e);
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
  yaml.load(path.join(process.cwd(), file), (result) => {
    if (result) {
      // console.log(JSON.stringify(result, null, 2));
      if (result.name) {
        models[result.name] = result; // add the parsed model to the global object
        resolve();
      } else {
        reject('Model must have a "name" property');
      }
    } else {
      reject('Invalid YAML file');
    }
  });
});

// parse each of the model properties for a build functions
const parse = async () => {
  // console.log('models.parse');
  try {
    let parsed = [];
    for (let model in models) { // loop over each model
      if (models.hasOwnProperty(model)) {
        parsed.push(parse_events(model));
        parsed.push(parse_property_events(model));
      }
    }
    return Promise.all(parsed);
  } catch (e) {
    console.log('Error: parse', e);
    throw e;
  }
};

// handles parsing of any of the models run / build functions
const parse_events = async (model) => {
  // console.log('models.parse_events');
  for (let key in models[model].data) {
    // handle pre_run and post_run events, these events will be executed before and after the entire run
    if (key.match(/_run$/)) {
      models[model].data[key] = new Function(
        'documents', 'globals', 'faker', 'chance',
        models[model].data[key]
      );
    }
    // handle pre_build and post_build events, these events will be executed before and after the each build of the model
    if (key.match(/_build$/)) {
      models[model].data[key] = new Function(
        'current_document', 'documents', 'globals', 'faker', 'chance',
        models[model].data[key]
      );
    }
  }
};

// handles parsing of any of the model property build functions
const parse_property_events = async (model) => {
  // console.log('model.parse_property_events');
  for (let property in models[model].properties) { // loop over each of the properties
    if (models[model].properties[property].data) { // if there is a data block
      for (let key in models[model].properties[property].data) {
        if (key.match(/build$/)) {
          models[model].properties[property].data[key] = new Function(
            'current_value', 'current_document', 'documents', 'globals', 'faker', 'chance',
            models[model].properties[property].data[key]
          );
        }
      }
    }
  }
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
