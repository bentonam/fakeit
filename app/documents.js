'use strict';

import faker from 'faker';
import Chance from 'chance';
const chance = new Chance();
import input from './input';
import output from './output';
import utils from './utils';
import objectPath from 'object-path';

let documents = {}; // global variable to keep track of the generated documents
let globals = {}; // a global variable to allow saving of values generated by models
let inputs; // a global variable to hold any input data

// executes the building of a model
const run = async (current_model, number_to_generate, number_override) => {
  // console.log('documents.run');
  inputs = inputs || input.get_inputs(); // set the inputs if they aren't set yet
  // define a key based on the model path to hold the generated documents and document_index for the model
  documents[current_model.name] = [];
  // if there is a pre_run function call it
  if (current_model.data && current_model.data.pre_run) {
    current_model.data.pre_run.apply(current_model, [ documents, globals, inputs, faker, chance ]);
  }
  // if we aren't generating a fixed number of documents from the command line and if the data.fixed attribute is set
  // and it is different from the number_to_generate the output totals need to be updated
  if (!number_override && current_model.data.fixed && current_model.data.fixed !== number_to_generate) {
    number_to_generate = current_model.data.fixed;
    output.update_entry_totals(current_model.name, number_to_generate);
  }
  let builds = [];
  let model_paths = get_model_paths(current_model);
  let document_paths = get_document_paths(current_model);
  console.log(`Generating ${number_to_generate} documents for ${current_model.name} model`);
  for (let i = 0; i < number_to_generate; i++) { // loop over each model and execute in order of dependency
    builds.push(
      build_document(current_model, model_paths, document_paths, i)
    );
  }
  return await Promise
                .all(builds)
                .then(() => {
                  if (current_model.data.post_run) {
                    current_model.data.post_run.apply(current_model, [ documents, globals, inputs, faker, chance ]);
                  }
                })
                .then(() => output.save(current_model, documents[current_model.name]))
                .catch((e) => {
                  throw e;
                });
};

// builds a document and saves it to the global documents variable, the outputs the result
const build_document = async (current_model, model_paths, document_paths, document_index) => {
  // console.log('inputs.build_document');
  try {
    // generate the initial values
    let generated_document = build(current_model, model_paths, document_paths, document_index);
    // console.log(JSON.stringify(generated_document));
    documents[current_model.name].push(generated_document);
  } catch (e) {
    throw e;
  }
};

// builds a document
const build = (current_model, model_paths, document_paths, document_index) => {
  // console.log('inputs.build');
  try {
    // generate the initial values
    let generated_document = initialize_document(current_model, model_paths, document_paths);
    // if there is a pre_build function for the document call it
    if (current_model.data && current_model.data.pre_build) {
      current_model.data.pre_build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
    }
    generated_document = build_object(current_model, generated_document, model_paths, document_paths, document_index);
    generated_document = build_process(current_model, generated_document, model_paths, document_paths, document_index);
    // if there is a post_build function for the document call it
    if (current_model.data && current_model.data.post_build) {
      current_model.data.post_build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
    }
    return generated_document;
  } catch (e) {
    throw e;
  }
};

// initializes a documents default values
const initialize_document = (current_model, model_paths, document_paths) => {
  // console.log('inputs.initialize_document');
  let generated_document = {};
  let key;
  try {
    model_paths.forEach((path, index) => {
      key = document_paths[index]; // set a key for error messaging
      objectPath.set(
        generated_document,
        key,
        initialize_value(objectPath.get(current_model, path).type)
      );
    });
    return generated_document;
  } catch (e) {
    throw new Error(`Error: Initializing Properties in Model: "${current_model.name}" for Key: "${key}", Reason: ${e.message}`);
  }
};

// generates the initial value for a variable based on the data type
const initialize_value = (data_type) => {
  // console.log('documents.initialize_value');
  let value;
  if (data_type === 'string') {
    value = '';
  } else if (data_type === 'object') {
    value = {};
  } else if ('number,integer,double,long,float'.indexOf(data_type) !== -1) {
    value = 0;
  } else if (data_type === 'array') {
    value = [];
  } else if ('boolean,bool'.indexOf(data_type) !== -1) {
    value = false;
  } else {
    value = null;
  }
  return value;
};

// builds an object based on a model
const build_object = (current_model, generated_document, model_paths, document_paths, document_index) => {
  // console.log('documents.build_object');
  let key;
  try {
    model_paths.forEach((path, index) => {
      key = document_paths[index]; // set a key for error messaging
      let value = build_value(
        generated_document,
        objectPath.get(current_model, path),
        objectPath.get(generated_document, key),
        document_index
      );
      objectPath.set(generated_document, key, value);
    });
    return generated_document;
  } catch (e) {
    throw new Error(`Error: Building Properties in Model: "${current_model.name}" for Key: "${key}", Reason: ${e.message}`);
  }
};

// builds a single value based on a property definition
const build_value = (generated_document, property, value, document_index) => {
  // console.log('documents.build_value');
  if (property.data) {
    // if there is a pre_build block
    if (property.data.pre_build) {
      value = property.data.pre_build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
    }
    if (property.data.fake) {
      value = faker.fake(property.data.fake);
    } else if (property.data.value) {
      value = property.data.value;
    } else if (property.data.build) {
      value = property.data.build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
    }
  } else if (property.type === 'array' && property.items) {
    value = build_array(generated_document, property, value, document_index);
  }
  return value;
};

// builds an array
const build_array = (generated_document, property, value, document_index) => {
  let number = property.items.data.fixed || chance.integer({ min: property.items.data.min || 0, max: property.items.data.max || 0 });
  if (property.items.type === 'object') {
    value = build_array_complex(generated_document, property, value, number, document_index);
  } else {
    value = build_array_simple(generated_document, property, value, number, document_index);
  }
  return value;
};

// builds a complex array
const build_array_complex = (generated_document, property, value, number, document_index) => {
  // console.log('documents.build_array_complex');
  let model_paths = get_model_paths(property.items);
  let document_paths = get_document_paths(property.items);
  for (let i = 0; i < number; i++) {
    value[i] = build(property.items, model_paths, document_paths, document_index); // eslint-disable-line babel/no-await-in-loop
  }
  return value;
};

// builds a simple array
const build_array_simple = (generated_document, property, value, number, document_index) => {
  // console.log('documents.build_array_simple');
  for (let i = 0; i < number; i++) {
    value[i] = build_value(
      generated_document,
      property.items,
      initialize_value(property.items.type),
      document_index
    ); // eslint-disable-line babel/no-await-in-loop
  }
  return value;
};

// processes a document after generation
const build_process = (current_model, generated_document, model_paths, document_paths, document_index) => {
  // console.log('documents.build_process');
  let key;
  try {
    model_paths.forEach((path, index) => {
      key = document_paths[index]; // set a key for error messaging
      objectPath.set(
        generated_document,
        key,
        build_process_callback(
          current_model,
          generated_document,
          objectPath.get(current_model, path),
          objectPath.get(generated_document, key),
          document_index
        )
      );
    });
    return generated_document;
  } catch (e) {
    throw new Error(`Error: Transforming Properties in Model: "${current_model.name}" for Key: "${key}", Reason: ${e.message}`);
  }
};

// callback the is used by build_process
// eslint-disable-next-line max-statements,complexity
const build_process_callback = (current_model, generated_document, property, value, document_index) => {
  // if there is a post_build block
  if (property.data && property.data.post_build) {
    value = property.data.post_build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
  } else if (property.items && property.items.data && property.items.data.post_build) {
    for (let i = 0; i < value.length; i++) {
      value[i] = property.items.data.post_build.apply(generated_document, [ documents, globals, inputs, faker, chance, document_index ]);
    }
  }
  // if the value is not null try to convert it to the correct type
  if (value !== null) {
    // if it is an integer make sure it is treated as such
    if ('number,integer,long'.indexOf(property.type) !== -1) {
      value = parseInt(value);
    }
    // if it is a double / float make sure it is treated as such
    if ('double,float'.indexOf(property.type) !== -1) {
      value = parseFloat(value);
    }
    // if it is a string make sure it is treated as such
    if (property.type === 'string' && typeof value !== 'undefined') {
      value = value.toString();
    }
    // if it is a string make sure it is treated as such
    if ('boolean,bool'.indexOf(property.type) !== -1 && typeof value !== 'undefined') {
      // if the value is a string that is 'false', '0', 'undefined', or 'null' as a string set a boolean false
      if (typeof value === 'string' && (value === 'false' || value === '0' || value === 'undefined' || value === 'null')) {
        value = false;
      }
      value = Boolean(value);
    }
  }
  return value;
};

// finds all of the properties paths in a model
const get_model_paths = (current_model) => {
  return utils.object_search(current_model, /^properties\.([^.]+|(?!items\.).+properties\.[^.]+)$/)
    .filter((path) => {
      return path.indexOf('items.properties') === -1;
    });
};

// finds all of the paths that will be used by a rendered document
const get_document_paths = (current_model) => {
  return get_model_paths(current_model).join(',').replace(/properties\./g, '').split(',');
};

export default { run };
