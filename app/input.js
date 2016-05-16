'use strict';

import path from 'path';
import yaml from 'yamljs';
import cson from 'cson';
import utils from './utils';
import csv_parse from 'csv-parse';
import AdmZip from 'adm-zip';

let inputs = {};

// pre run setup / handle settings
const prepare = (options) => new Promise((resolve, reject) => {
  try {
    // console.log('input.prepare');
    if (options.input) {
      list(options)
        .then(filter)
        .then(load)
        .then(resolve)
        .catch((err) => {
          reject(err);
        });
    } else {
      resolve();
    }
  } catch (e) {
    reject(e);
  }
});

// gets the available input files
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

// filter files for valid input formats: csv, json, cson, yaml and zip
const filter = async (files) => {
  // console.log('input.filter');
  files = files.filter((file) => {
    return file.match(/\.(csv|json|cson|ya?ml|zip)$/i);
  });
  if (!files.length) {
    throw new Error('No valid input files found.');
  }
  return files;
};

// loop over all of the found yaml files and load them
const load = async (files) => {
  // console.log('input.load', files);
  let data = [];
  files.forEach((file) => {
    file = path.resolve(file); // resolve the full path
    let info = path.parse(file); // parse the full path to get the name and extension
    if (info.ext === '.zip') { // if it is a zip file, load each of the zip archives entries
      data.push(load_zip_file(file));
    } else { // read the file and parse its contents
      data.push(
        utils.read_file(file)
          .then((content) => parse(info.name, info.ext.replace(/^\./, ''), content))
      );
    }
  });
  return await Promise.all(data);
};

// handles parsing each of the supported formats
const parse = (name, type, content) => new Promise((resolve, reject) => {
  // console.log('input.parse');
  let result;
  switch (type) {
  case 'json':
    result = parse_json(content);
    break;
  case 'yaml':
  case 'yml':
    result = parse_yaml(content);
    break;
  case 'csv':
    result = parse_csv(content);
    break;
  case 'cson':
    result = parse_cson(content);
    break;
  default:
    reject(new Error(`No valid parser could be found for "${name}.${type}"`));
  }
  result
    .then((data) => { // after it has been parsed save it to the inputs
      inputs[name] = data;
    })
    .then(resolve)
    .catch(() => { // something went wrong throw an error
      reject(new Error(`Unable to parse input file "${name}.${type}"`));
    });
});

// handles processing a zip archive entries and parsing their contents
const load_zip_file = (file) => new Promise((resolve, reject) => {
  // console.log('input.load_zip_file');
  try {
    let zip = new AdmZip(file);
    let entries = [];
    zip.getEntries().forEach((entry) => {
      if (!entry.isDirectory && !entry.entryName.match(/^(\.|__MACOSX)/)) {
        let info = path.parse(entry.entryName);
        entries.push(
          parse(info.name, info.ext.replace(/^\./, ''), zip.readAsText(entry.entryName))
        );
      }
    });
    Promise.all(entries)
            .then(resolve)
            .catch((err) => {
              reject(err);
            });
  } catch (e) {
    reject(new Error(`Error loading: ${file}`));
  }
});

// parses a json string
const parse_json = (content) => new Promise((resolve, reject) => {
  // console.log('input.parse_json');
  try {
    resolve(JSON.parse(content));
  } catch (e) {
    reject(e);
  }
});

// parses a yaml string
const parse_yaml = (content) => new Promise((resolve, reject) => {
  // console.log('input.parse_yaml');
  try {
    resolve(yaml.parse(content));
  } catch (e) {
    reject(e);
  }
});

// parses a csv string
const parse_csv = (content) => new Promise((resolve, reject) => {
  // console.log('input.parse_csv');
  csv_parse(content, { columns: true }, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

// parses a cson string
const parse_cson = (content) => new Promise((resolve, reject) => {
  // console.log('input.load_cson_file');
  cson.parse(content, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const get_inputs = () => {
  return inputs;
};

export default { prepare, get_inputs };
