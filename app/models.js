'use strict';

import yaml from 'yamljs';
import path from 'path';
import Chance from 'chance';
const chance = new Chance();
import documents from './documents';
import utils from './utils';
import objectPath from 'object-path';

let models = {}; // global variable to hold parsed models
let model_order = []; // global variable to hold the model run order
let model_dependencies = []; // global variable to hold all dependencies
let model_count = 0; // global variable to hold the number of available models
let model_documents_count = {}; // global variable to hold the number of documents to generate for each model
let settings; // global variable to hold the available options / settings

// pre run setup / handle settings
const prepare = (options) => new Promise((resolve, reject) => {
  settings = options;

  return list(options)
          .then(filter)
          .then(load)
          .then(validate)
          .then(parse)
          .then(resolve_dependencies)
          .then(() => set_document_counts(options))
          .then(resolve)
          .catch((err) => {
            reject(err);
          });
});

// gets the available model yaml files from the current working directory
const list = (options) => new Promise((resolve, reject) => {
  // console.log('models.list');
  try {
    utils.is_directory(options.models)
      .then(utils.read_directory)
      .then((files) => {
        resolve(files);
      })
      .catch(() => {
        resolve(options.models.split(','));
      });
  } catch (e) {
    reject(e);
  }
});

// filter files for valid models
const filter = async (files) => {
  // console.log('models.filter');
  files = files.filter((file) => {
    return file.match(/\.ya?ml$/i);
  });
  if (!files.length) {
    throw new Error('No valid model files found.');
  }
  return files;
};

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
      reject(new Error(`Invalid YAML file: ${file}`));
    }
  });
});

// validate the model
const validate = async () => {
  // console.log('models.validate');
  for (let model in models) {
    if (!models[model].name) {
      throw new Error(`The model ${model} must have a "name" property.`);
    }
    if (!models[model].type) {
      throw new Error(`The model ${model} must have a "type" property.`);
    }
    if (!models[model].key) {
      throw new Error(`The model ${model} must have a "key" property.`);
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
    return await Promise.all(parsed);
  } catch (e) {
    throw e;
  }
};

const parse_model = async (model) => {
  // console.log('models.parse_model');
  await parse_model_functions(model);
  await parse_model_references(model);
  await parse_model_types(model);
  await parse_model_defaults(model);
};

// searches the model for any of the pre / post run and build functions and generates them
const parse_model_functions = async (model) => {
  // console.log('models.parse_model_functions');
  let results = utils.object_search(models[model], /((pre|post)_run)|(pre_|post_)?build$/);
  results.forEach((function_path) => {
    try {
      objectPath.set(
        models[model],
        function_path,
        new Function(
          'documents', 'globals', 'inputs', 'faker', 'chance', 'document_index',
          objectPath.get(models[model], function_path)
        )
      );
    } catch (e) {
      throw new Error(`Function Error in model "${models[model].name}", for property: ${function_path}, Reason: ${e.message}`);
    }
  });
};

// searches the model for any '$ref' values that are pointing to definitions, sub_models, etc. and copies the reference to the schema
const parse_model_references = async (model) => {
  // console.log('models.parse_model_references');
  let pattern = /\.(schema|items).\$ref$/;
  let results = utils.object_search(models[model], pattern);
  results.forEach((reference_path) => {
    let property_path = reference_path.replace(pattern, '') + (reference_path.indexOf('.items.') !== -1 ? '.items' : '');
    let property = objectPath.get(models[model], property_path);
    let defined_path = objectPath.get(models[model], reference_path).replace(/^#\//, '').replace('/', '.');
    property = Object.assign({}, property, objectPath.get(models[model], defined_path));
    objectPath.set(models[model], property_path, property);
  });
};

// searches the model for any properties or items and makes sure the defaults exist
const parse_model_types = async (model) => {
  // console.log('models.parse_model_properties');
  let results = utils.object_search(models[model], /.*properties\.[^.]+(\.items)?$/);
  results.forEach((type_path) => {
    let property = objectPath.get(models[model], type_path);
    // make sure there is a type property set
    if (!property.hasOwnProperty('type')) {
      property.type = 'undefined';
      objectPath.set(models[model], type_path, property);
    }
  });
};

// sets any model defaults that are not defined
const parse_model_defaults = async (model) => {
  // console.log('models.parse_model_defaults');
  // find properties or items that do not have a data block and assign it
  let results = utils.object_search(models[model], /^(.*properties\.[^.]+)$/);
  results.forEach((data_path) => {
    let property = objectPath.get(models[model], data_path);
    // if the property is an array that has an items block but not a data block, default it
    if (property.type === 'array') {
      if (property.items && !property.items.data) {
        property.items.data = {};
      }
    } else if (!property.data) {
      property.data = {};
    }
    objectPath.set(models[model], data_path, property);
  });
  // find any data property at the root or that is a child of items and make sure it has the defaults for min, max, fixed
  results = utils.object_search(models[model], /^(.*properties\.[^.]+\.items\.data|(data))$/);
  const data_defaults = {
    min: 0,
    max: 0,
    fixed: 0
  };
  results.forEach((data_path) => {
    objectPath.set(
      models[model],
      data_path,
      Object.assign({}, data_defaults, objectPath.get(models[model], data_path))
    );
  });
};

// resolve the dependencies and establish the order the models should be parsed in
const resolve_dependencies = async () => {
  // console.log('models.resolve_dependencies');
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
    throw new Error(`The following Model Dependencies could not be resolved: ${unresolvable_dependencies().join(', ')}`);
  }
  // console.log('Models will be generated in the following order: %s', model_order.join(', '));
};

// builds an array of all of the dependencies that could not be resolved
const unresolvable_dependencies = () => {
  return model_dependencies.filter((v) => {
    return model_order.indexOf(v) === -1;
  });
};

// determines if all dependencies have been resolved or not
const check_dependencies = (dependencies) => {
  let resolved = 0;
  // loop over each of the models dependencies and check if its dependencies have been resolved
  for (let i = 0; i < dependencies.length; i++) {
    if (model_dependencies.indexOf(dependencies[i]) === -1) { // if the dependency has been added yet add it
      model_dependencies.push(dependencies[i]);
    }
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

// resolve the dependencies and establish the order the models should be parsed in
const get_document_counts = () => {
  return model_documents_count;
};

// resolve the dependencies and establish the order the models should be parsed in
const set_document_counts = async () => {
  // console.log('models.set_document_counts');
  model_order.forEach((v) => {
    let current_model = models[v];
    let number;
    if (settings.number) {
      number = parseInt(settings.number);
    } else {
      number = current_model.data.fixed || chance.integer({ min: current_model.data.min, max: current_model.data.max }) || 1;
    }
    model_documents_count[v] = number;
  });
  return model_documents_count;
};

// handles generation of data for each model
const generate = async () => {
  // console.log('models.generate');
  for (let i = 0; i < model_order.length; i++) { // loop over each model and execute in order of dependency
    await documents.run(// eslint-disable-line babel/no-await-in-loop
      models[model_order[i]],
      model_documents_count[models[model_order[i]].name],
      typeof settings.number !== 'undefined' && parseInt(settings.number) > 0
    ); // eslint-disable-line babel/no-await-in-loop
  }
};

// handles generation of data for each model
const get_model_names = () => {
  return Object.keys(models);
};

export default { prepare, generate, get_model_names, get_document_counts };
