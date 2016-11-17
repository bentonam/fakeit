import path from 'path';
import yaml from 'yamljs';
import cson from 'cson';
import * as utils from './utils';
import csvParse from 'csv-parse';
import AdmZip from 'adm-zip';

let inputs = {};

// pre run setup / handle settings
export function prepare(options) {
  return new Promise((resolve, reject) => {
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
}

// gets the available input files
function list(options) {
  return new Promise((resolve, reject) => {
    // console.log('input.list');
    try {
      utils.isDirectory(options.input)
        .then(utils.readDirectory)
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
}

// filter files for valid input formats: csv, json, cson, yaml and zip
async function filter(files) {
  // console.log('input.filter');
  files = files.filter((file) => {
    return file.match(/\.(csv|json|cson|ya?ml|zip)$/i);
  });
  if (!files.length) {
    throw new Error('No valid input files found.');
  }
  return files;
}

// loop over all of the found yaml files and load them
async function load(files) {
  // console.log('input.load', files);
  let data = [];
  files.forEach((file) => {
    file = path.resolve(file); // resolve the full path
    let info = path.parse(file); // parse the full path to get the name and extension
    if (info.ext === '.zip') { // if it is a zip file, load each of the zip archives entries
      data.push(loadZipFile(file));
    } else { // read the file and parse its contents
      data.push(
        utils.readFile(file)
          .then((content) => parse(info.name, info.ext.replace(/^\./, ''), content))
      );
    }
  });
  return await Promise.all(data);
}

// handles parsing each of the supported formats
function parse(name, type, content) {
  return new Promise((resolve, reject) => {
    // console.log('input.parse');
    let result;
    switch (type) {
      case 'json':
        result = parseJson(content);
        break;
      case 'yaml':
      case 'yml':
        result = parseYaml(content);
        break;
      case 'csv':
        result = parseCsv(content);
        break;
      case 'cson':
        result = parseCson(content);
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
}

// handles processing a zip archive entries and parsing their contents
function loadZipFile(file) {
  return new Promise((resolve, reject) => {
    // console.log('input.loadZipFile');
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
}

// parses a json string
function parseJson(content) {
  return new Promise((resolve, reject) => {
    // console.log('input.parseJson');
    try {
      resolve(JSON.parse(content));
    } catch (e) {
      reject(e);
    }
  });
}

// parses a yaml string
function parseYaml(content) {
  return new Promise((resolve, reject) => {
    // console.log('input.parseYaml');
    try {
      resolve(yaml.parse(content));
    } catch (e) {
      reject(e);
    }
  });
}

// parses a csv string
function parseCsv(content) {
  return new Promise((resolve, reject) => {
    // console.log('input.parseCsv');
    csvParse(content, { columns: true }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// parses a cson string
function parseCson(content) {
  return new Promise((resolve, reject) => {
    // console.log('input.parseCson');
    cson.parse(content, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function getInputs() {
  return inputs;
}
