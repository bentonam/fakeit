import faker from 'faker';
import Chance from 'chance';
const chance = new Chance();
import Base from './base';
import { series } from 'async-array-methods';
import { objectSearch } from './utils';
import objectPath from 'object-path';
import to from 'to-js';


export default class Documents extends Base {
  constructor(options, _inputs = {}) {
    super(options);
    this.documents = {};
    this.globals = {};
    this.inputs = _inputs;
  }
  generateDocuments(...models) {
    const doc = new Document(this.options, this.documents, this.globals, this.inputs);
    return series(to.flatten(models), (model) => doc.build(model));
  }
}

export class Document extends Base {
  constructor(options, documents = {}, globals = {}, inputs = {}) {
    super(options);
    this.options = this.options || {};
    this.documents = documents;
    this.globals = globals;
    this.inputs = inputs;
  }

  async build(model) {
    if (!this.documents[model.name]) {
      this.documents[model.name] = [];
    }

    if (!model.data) {
      model.data = {};
    }
    // if there is a pre_run function call it
    this.runData(model.data.pre_run, model);

    this.log('info', `Generating ${model.count} documents for ${model.name} model`);

    for (let i = 0; i < model.count; i++) { // loop over each model and execute in order of dependency
      this.documents[model.name].push(
        this.buildDocument(model, getPaths(model), i)
      );
    }

    this.runData(model.data.post_run, model);
    return this.documents[model.name];
  }

  // used to run the different functions that the users can pass in
  runData(data, context, index) {
    if (data) {
      return data.apply(context, [ this.documents, this.globals, this.inputs, faker, chance, index ]);
    }
  }

  // builds a document
  buildDocument(model, paths, index) {
    // generate the initial values
    let doc = this.initializeDocument(model, paths);

    // if there is a pre_build function for the document call it
    this.runData(model.data.pre_build, doc, index);

    doc = this.buildObject(model, doc, paths, index);
    doc = this.buildProcess(model, doc, paths, index);

    // if there is a post_build function for the document call it
    this.runData(model.data.post_build, doc, index);

    return doc;
  }

  // initializes a documents default values
  initializeDocument(model, paths) {
    // console.log('inputs.this.initializeDocument');
    const doc = {};
    let key;
    try {
      paths.model.forEach((path, i) => {
        key = paths.document[i]; // set a key for error messaging
        objectPath.set(doc, key, typeToValue(objectPath.get(model, path).type));
      });
      return doc;
    } catch (e) {
      throw new Error(`Error: Initializing Properties in Model: "${model.name}" for Key: "${key}", Reason: ${e.message}`);
    }
  }

  // builds an object based on a model
  buildObject(model, doc, paths, index) {
    // console.log('documents.this.buildObject');
    let key;
    try {
      paths.model.forEach((path, i) => {
        key = paths.document[i]; // set a key for error messaging
        objectPath.set(doc, key, this.buildValue(
          doc,
          objectPath.get(model, path),
          objectPath.get(doc, key),
          index
        ));
      });
      return doc;
    } catch (e) {
      throw new Error(`Error: Building Properties in Model: "${model.name}" for Key: "${key}", Reason: ${e.message}`);
    }
  }

  // builds a single value based on a property definition
  buildValue(doc, property, value, index) {
    // console.log('documents.this.buildValue');
    if (property.data) {
      // if there is a pre_build block

      if (property.data.pre_build) {
        value = this.runData(property.data.pre_build, doc, index);
      }
      if (property.data.fake) {
        value = faker.fake(property.data.fake);
      } else if (property.data.value) {
        value = property.data.value;
      } else if (property.data.build) {
        value = this.runData(property.data.build, doc, index);
      }
    } else if (
      property.type === 'array' &&
      property.items
    ) {
      value = this.buildArray(doc, property, value, index);
    }
    return value;
  }

  // builds an array
  buildArray(doc, property, value, index) {
    let number = property.items.data.fixed;
    if (!number) {
      number = chance.integer({
        min: property.items.data.min || 0,
        max: property.items.data.max || 0
      });
    }

    // builds a complex array
    if (property.items.type === 'object') {
      const paths = getPaths(property.items);
      for (let i = 0; i < number; i++) {
        value[i] = this.buildDocument(property.items, paths, index);
      }
      return value;
    }


    // builds a simple array
    for (let i = 0; i < number; i++) {
      value[i] = this.buildValue(doc, property.items, typeToValue(property.items.type), index);
    }
    return value;
  }

  // processes a document after generation
  buildProcess(model, doc, paths, index) {
    // console.log('documents.this.buildProcess');
    let key;
    try {
      paths.model.forEach((path, i) => {
        key = paths.document[i]; // set a key for error messaging
        objectPath.set(
          doc,
          key,
          this.buildProcessCallback(model, doc, objectPath.get(model, path), objectPath.get(doc, key), index)
        );
      });
      return doc;
    } catch (e) {
      throw new Error(`Error: Transforming Properties in Model: "${model.name}" for Key: "${key}", Reason: ${e.message}`);
    }
  }

  // callback the is used by this.buildProcess
  buildProcessCallback(model, doc, property, value, index) {
    // if there is a post_build block
    if (
      property.data &&
      property.data.post_build
    ) {
      value = this.runData(property.data.post_build, doc, index);
    } else if (
      property.items &&
      property.items.data &&
      property.items.data.post_build
    ) {
      for (let i = 0; i < value.length; i++) {
        value[i] = this.runData(property.items.data.post_build, doc, index);
      }
    }
    // if the value is not null try to convert it to the correct type
    if (value !== null) {
      // if it is an integer make sure it is treated as such
      if ('number,integer,long'.includes(property.type)) {
        value = parseInt(value);
      }
      // if it is a double / float make sure it is treated as such
      if ('double,float'.includes(property.type)) {
        value = parseFloat(value);
      }
      // if it is a string make sure it is treated as such
      if (
        property.type === 'string' &&
        typeof value !== 'undefined'
      ) {
        value = value.toString();
      }
      // if it is a string make sure it is treated as such
      if (
        'boolean,bool'.includes(property.type) &&
        typeof value !== 'undefined'
      ) {
        // if the value is a string that is 'false', '0', 'undefined', or 'null' as a string set a boolean false
        if (
          typeof value === 'string' && (
            value === 'false' ||
            value === '0' ||
            value === 'undefined' ||
            value === 'null'
          )
        ) {
          value = false;
        }
        value = Boolean(value);
      }
    }
    return value;
  }
}

// finds all the paths to be used
function getPaths(obj) {
  // finds all of the properties paths in a model
  const model = objectSearch(obj, /^properties\.([^.]+|(?!items\.).+properties\.[^.]+)$/)
    .filter((str) => !str.includes('items.properties'));

  return {
    model,
    // finds all of the paths that will be used by a rendered document
    document: model.join(',').replace(/properties\./g, '').split(','),
  };
}


// generates the initial value for a variable based on the data type
function typeToValue(type) {
  // console.log('documents.typeToValue');
  if (type === 'string') {
    return '';
  } else if (type === 'object') {
    return {};
  } else if ('number,integer,double,long,float'.includes(type)) {
    return 0;
  } else if (type === 'array') {
    return [];
  } else if ('boolean,bool'.includes(type)) {
    return false;
  }
  return null;
}
