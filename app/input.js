'use strict';

import path from 'path';
import yaml from 'yamljs';
import cson from 'cson';
import utils from './utils';
import csv_parse from 'csv-parse';

let inputs = {};

// pre run setup / handle settings
const prepare = (options) => new Promise((resolve, reject) => {
  try {
    // console.log('input.prepare');
    if (options.input) {
      list(options)
        .then(filter)
        .then(load)
        .then(resolve);
    } else {
      resolve();
    }
  } catch (e) {
    reject(e);
  }
});

// gets the available input json and yaml files from the current working directory
const list = (options) => new Promise((resolve, reject) => {
  // console.log('input.list');
  try {
    utils.is_directory(options.input)
      .then(utils.read_directory)
      .then((files) => {
        resolve(files);
      })
      .catch(() => {
        resolve(options.input.split(','));
      });
  } catch (e) {
    reject(e);
  }
});

// filter files for valid models
const filter = async (files) => {
  // console.log('input.filter');
  files = files.filter((file) => {
    return file.match(/\.(csv|json|cson|ya?ml)$/i);
  });
  if (!files.length) {
    throw new Error('No valid input files found.');
  }
  return files;
};

// loop over all of the found yaml files and load them
const load = async (files) => {
  // console.log('input.load', files);
  let tmp = [];
  files.forEach((v) => {
    v = path.resolve(v);
    if (v.match(/.json$/i)) {
      tmp.push(load_json_file(v));
    } else if (v.match(/\.ya?ml$/i)) {
      tmp.push(load_yaml_file(v));
    } else if (v.match(/\.csv$/i)) {
      tmp.push(load_csv_file(v));
    } else if (v.match(/\.cson$/i)) {
      tmp.push(load_cson_file(v));
    }
  });
  return await Promise.all(tmp);
};

// loop over all of the found yaml files and load them
const load_json_file = (file) => new Promise((resolve, reject) => {
  // console.log('input.load_json', file);
  try {
    return utils.read_file(file)
      .then((data) => {
        return JSON.parse(data);
      })
      .then((data) => {
        inputs[path.parse(file).name] = data;
      })
      .then(resolve);
  } catch (e) {
    reject(e);
  }
});

// load and convert a yaml file to a json object
const load_yaml_file = (file) => new Promise((resolve, reject) => {
  // console.log('input.load_yaml_file');
  yaml.load(file, (result) => {
    if (result) {
      inputs[path.parse(file).name] = result;
      resolve();
    } else {
      reject(`Invalid YAML file: ${file}`);
    }
  });
});

// load and convert a csv file to a json object
const load_csv_file = (file) => new Promise((resolve, reject) => {
  // console.log('input.load_csv_file');
  utils.read_file(file)
    .then((content) => {
      csv_parse(content, (err, result) => {
        if (err) {
          reject(err);
        } else {
          inputs[path.parse(file).name] = result;
          resolve();
        }
      });
    });
});

// load and convert a cson file to a json object
const load_cson_file = (file) => new Promise((resolve, reject) => {
  // console.log('input.load_cson_file');
  cson.load(file, (err, result) => {
    if (err) {
      reject(`Invalid CSON file: ${file}`);
    } else {
      inputs[path.parse(file).name] = result;
      resolve();
    }
  });
});

const get_inputs = () => {
  return inputs;
};

export default { prepare, get_inputs };
