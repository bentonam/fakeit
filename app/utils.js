////
/// @name Utils
/// @page api/utils
/// @description These are all the utility functions used throughout the application
////

import path from 'path';
import globby from 'globby';
import { map } from 'async-array-methods';
import to, { is } from 'to-js';
import AdmZip from 'adm-zip';
import promisify from 'es6-promisify';
import fs from 'fs-extra-promisify';
import PromisePool from 'es6-promise-pool';


/// @name objectSearch
/// @description Recursively looks through objects and finds the pattern provided
/// @arg {object, array} data - The data to search through
/// @arg {regex,string} pattern - The pattern used to match a path
/// @arg {string} current_path - The current part of the path. This is used as apart of the recursion and you shouldn't pass anyting to it manually.
/// @arg {array} paths - The paths that have been match. This is used as apart of the recursion and you shouldn't pass anyting to it manually.
/// @returns {array} - With the paths that have been matched
export function objectSearch(data, pattern, current_path, paths = []) {
  function appendPath(opath, index) {
    opath = opath ? opath + '.' + index : '' + index;
    opath = opath.replace(/^\.|\.$|\.{2,}/, '');
    return opath;
  }
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      let test_path = appendPath(current_path, i);
      if (
        test_path.match(pattern) &&
        paths.indexOf(test_path) === -1
      ) {
        paths.push(test_path);
      }
      objectSearch(data[i], pattern, test_path, paths);
    }
  } else if (
    typeof data === 'object' &&
    data !== null
  ) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let test_path = appendPath(current_path, key);
        if (
          test_path.match(pattern) &&
          paths.indexOf(test_path) === -1
        ) {
          paths.push(test_path);
        }
        objectSearch(data[key], pattern, test_path, paths);
      }
    }
  }
  return paths;
}

/// @name findFiles
/// @description
/// This is a very efficient way to to recursively read a directory and get all the files.
/// @arg {string, array} globs - The glob(s) or dir(s) you want to get all the files from
/// @returns {array} All the files in the paths(s) that were passed
/// @async
export async function findFiles(globs) {
  // all the files after
  const files = [];
  const sort = (list) => {
    const to_search = [];
    list = to.flatten(list);
    for (let item of list) {
      if (!!path.extname(item)) {
        files.push(item);
      } else {
        to_search.push(item);
      }
    }
    return to_search;
  };

  const find = async (items) => {
    items = sort(await map(items, (item) => {
      if (globby.hasMagic(item)) {
        return globby(item);
      } else if (!!path.extname(item)) {
        return item;
      }

      return globby(path.join(item, '*'));
    }));
    if (items.length) {
      return find(items);
    }
  };

  await find(to.array(globs));
  return files;
}


/// @name readFiles
/// @description
/// This will read all the files that have been passed to it and return them in an array of objects.
/// @arg {string, array} files - The files to read. This can be any file including `zip`.
/// @returns {array} An `array` of files where each object will have the following information
///
/// ```js
/// {
///   path: '', // the full path of the file
///   content: '', // the contents of the file as a string
///   // the rest of the keys are the same as what you would get from running `path.parse`
///   root: '',
///   dir: '',
///   base: '',
///   ext: '',
///   name: '',
/// }
/// ```
/// @async
export async function readFiles(files) {
  if (!files) return;

  files = to.array(files);

  files = await map(files, async (file) => {
    file = path.resolve(file); // resolve the full path
    let info = path.parse(file); // parse the full path to get the name and extension
    if (info.ext === '.zip') {
      const zip = new AdmZip(file);
      return map(zip.getEntries(), async (entry) => {
        if (!entry.isDirectory && !entry.entryName.match(/^(\.|__MACOSX)/)) {
          let file_info = path.parse(entry.entryName); // eslint-disable-line
          file_info.path = entry.entryName;
          file_info.content = await zip.readAsText(entry.entryName);
          return file_info;
        }
      });
    }

    info.path = file;
    info.content = to.string(await fs.readFile(file));
    return info;
  });


  return to.flatten(files);
}

/// @name pool
/// @description
/// This is very similar to the `Array.prototype.map` except that
/// it's used to limit the number of functions running at a time.
/// @arg {array} items - The array to loop over
/// @arg {function} fn - The function to run on each of the items. It has the same arguments the map function does
/// @arg {number} limit [100] - The number of promises that can run at any given item.
/// @returns {array} of the items that were returned by the fn.
/// @async
export async function pool(items, fn, limit = 100) {
  let i = 0;
  const results = [];
  const producer = () => {
    if (i < items.length) {
      const index = i;
      return fn(items[index], i++, items)
        .then((result) => {
          results[index] = result;
        });
    }

    return null;
  };

  const runner = new PromisePool(producer, limit);

  await runner.start();
  return results;
}


/// @name parsers
/// @description
/// This holds all the parsers that this project uses and normalizes
/// them to all function the same way.
/// Each parser in this object has 2 functions `parse`, and `stringify`.
/// @type {object}
const parsers = {};
import yaml from 'yamljs';
import cson from 'cson';
import csvParse from 'csv-parse';
import csvStringify from 'csv-stringify';

const csv = {
  parse: promisify(csvParse),
  stringify: promisify(csvStringify)
};

///# @name parsers.yaml
///# @alias parsers.yml
///# @type {object}
parsers.yaml = parsers.yml = {
  ///# @name parsers.yaml.parse
  ///# @alias parsers.yml.parse
  ///# @arg {string, object} obj
  ///# @returns {object} - The javascript object
  ///# @async
  parse: (obj) => Promise.resolve(yaml.parse(obj)),

  ///# @name parsers.yaml.stringify
  ///# @alias parsers.yml.stringify
  ///# @arg {object} obj
  ///# @arg {number} indent [2] The indent level
  ///# @returns {string} - The yaml string
  ///# @async
  stringify: (obj, indent = 2) => Promise.resolve(yaml.stringify(obj, null, indent).trim())
};

///# @name parsers.json
///# @type {object}
parsers.json = {
  ///# @name parsers.json.parse
  ///# @arg {string, object} obj
  ///# @returns {object} - The javascript object
  ///# @async
  parse: (obj) => Promise.resolve(JSON.parse(obj)),

  ///# @name parsers.json.stringify
  ///# @arg {object} obj
  ///# @arg {number} indent [2] The indent level
  ///# @returns {string} - The yaml string
  ///# @async
  stringify: (obj, indent = 2) => Promise.resolve(JSON.stringify(obj, null, indent))
};

///# @name parsers.cson
///# @type {object}
parsers.cson = {
  ///# @name parsers.cson.parse
  ///# @arg {string, object} obj
  ///# @returns {object} - The javascript object
  ///# @async
  parse: (obj) => {
    return new Promise((resolve, reject) => {
      cson.parse(obj, {}, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  ///# @name parsers.cson.stringify
  ///# @arg {object} obj
  ///# @arg {number} indent [2] The indent level
  ///# @returns {string} - The yaml string
  ///# @async
  stringify: (obj, indent = 2) => Promise.resolve(cson.stringify(obj, null, indent))
};

///# @name parsers.csv
///# @type {object}
parsers.csv = {
  ///# @name parsers.csv.parse
  ///# @arg {string, object}
  ///# @returns {array} - The javascript object
  ///# @async
  async parse(obj) {
    const result = await csv.parse(obj, { columns: true });

    // The following should be an object but the csv parser returns it as a string so this is used to fix that mistake
    // `"{\"latitude\":-6.081689835,\"longitude\":145.3919983,\"level-2\":{\"level-3\":\"woohoo\"}}"`
    // it also doesn't handle numbers correctly so this fixes those instances as well
    function fix(a, b) {
      if (!a || !b) {
        return a;
      }

      for (let k in b) { // eslint-disable-line
        if (b.hasOwnProperty(k)) {
          if (is.plainObject(b[k])) {
            a[k] = is.plainObject(a[k]) ? fix(a[k], b[k]) : b[k];
          } else if (is.string(b[k]) && /^[0-9]+$/.test(b[k])) {
            // convert string into a number
            a[k] = to.number(b[k]);
          } else if (is.string(b[k]) && b[k][0] === '{') {
            // convert string into an object
            a[k] = fix({}, to.object(b[k]));
          } else {
            a[k] = b[k];
          }
        }
      }

      return a;
    }

    return result.map((item) => fix({}, item));
  },

  ///# @name parsers.csv.stringify
  ///# @arg {object} obj
  ///# @arg {object} options [{ header: true, quotedString: true }] The csv options
  ///# @returns {string} - The yaml string
  ///# @async
  async stringify(obj, options) {
    if (typeof options !== 'object') {
      options = {};
    }
    options = to.extend({ header: true, quotedString: true }, options);
    const result = await csv.stringify(to.array(obj), options);
    return result.trim();
  }
};

export { parsers };


import chalk from 'chalk';
import symbols from 'log-symbols';
import perfy from 'perfy';
symbols.warn = symbols.warning;
symbols.ok = symbols.okay = symbols.success;

/// @name Logger
/// @description
/// This is the main logger for the application
export class Logger {
  ///# @name constructor
  ///# @arg {object} options [{ log: true, verbose: false, timestamp: true }]
  constructor(options = {}) {
    this.options = to.extend({
      log: true,
      verbose: false,
      timestamp: true,
    }, options);

    // ensure that if `verbose` is true then `log` must also be true
    if (this.options.verbose) {
      this.options.log = true;
    }

    ///# @name log_types
    ///# @static
    ///# @type {object}
    ///# @raw-code
    this.log_types = {
      error: 'red',
      warning: 'yellow',
      success: 'green', // possibly remove
      info: 'blue',
      verbose: 'magenta',
      log: 'gray'
    };
  }

  ///# @name log
  ///# @description This is used to control the logging of an app
  ///# @arg {*} type
  ///# If this is a `string` and matches `error`, `warning`, `success`, `info`, `verbose`, `log` then it
  ///# will add special characters before the rest of the log depending on the type that was passed.
  ///# If it's not one of these then the type will default to `log` and the value you passed will be
  ///# prepended to the rest of the arguments
  ///# @arg {*} ...args - Any other arguments that you wish to pass
  ///# @chainable
  log(type, ...args) {
    if (type instanceof Error) {
      args.unshift(type);
      type = 'error';
    }
    if (this.options.log || type === 'error') {
      if ([ 'time', 'timeEnd' ].includes(type)) {
        return this[type](...args);
      }

      if (!to.keys(this.log_types).includes(type)) {
        args.unshift(type);
        type = 'log';
      }

      if (type === 'verbose') {
        if (!this.options.verbose) return;
        type = 'console';
      }

      const stamp = this.stamp(type);

      // print the current time.
      if (stamp) {
        process.stdout.write(stamp);
      }

      console[type](...args);

      if (type === 'error') {
        throw new Error(args.join('\n'));
      }
    }
    return this;
  }

  ///# @name stamp
  ///# @description This will generate a colorized timestamp and message depending on the time that's passed.
  ///# @arg {string} type ['log'] - This determins the type of stamp to return. This can be any of the types that you can pass to `this.log`
  ///# @returns {string} The stamp that was generated.
  stamp(type = 'log') {
    const now = new Date();
    const timestamp = [ now.getHours(), now.getMinutes(), now.getSeconds() ].join(':');
    const color = this.log_types[type];
    let stamp = this.options.timestamp ? `[${chalk.magenta(timestamp)}] ` : '';
    if (symbols[type]) {
      stamp += `${symbols[type]} `;
    }
    if ([ 'error', 'warning', 'warn', 'info' ].includes(type)) {
      stamp += `${chalk[color](type)}: `;
    }

    return stamp;
  }

  ///# @name error
  ///# @description This is an alias for `this.log('error', 'message.....')
  ///# @arg {*} ...args - The message that should be passed
  ///# @chainable
  error(...args) {
    this.log('error', ...args);
    return this;
  }

  ///# @name warn
  ///# @description This is an alias for `this.log('warn', 'message.....')
  ///# @arg {*} ...args - The message that should be passed
  ///# @chainable
  warn(...args) {
    this.log('warning', ...args);
    return this;
  }

  ///# @name info
  ///# @description This is an alias for `this.log('info', 'message.....')
  ///# @arg {*} ...args - The message that should be passed
  ///# @chainable
  info(...args) {
    this.log('info', ...args);
    return this;
  }

  ///# @name verbose
  ///# @description This is an alias for `this.log('verbose', 'message.....')
  ///# @arg {*} ...args - The message that should be passed
  ///# @chainable
  verbose(...args) {
    this.log('info', ...args);
    return this;
  }

  ///# @name time
  ///# @description
  ///# This does the same thing as `console.time`.
  ///# @arg {string} label - This is the label for your timed event
  ///# @chainable
  time(label) {
    if (!label) {
      return this.error('You must pass in a label for `Logger.prototype.time`', (new Error()).trace);
    }
    perfy.start(label);
    return this;
  }

  ///# @name timeEnd
  ///# @description
  ///# This does the same thing as `console.timeEnd`.
  ///# @arg {string} label - This must be the same label that was passed to the associated `this.time` function
  ///# @returns {string} - The total time it took to run the process
  timeEnd(label) {
    if (!label) {
      return this.error('You must pass in a label for `Logger.prototype.timeEnd`', (new Error()).trace);
    }
    let time = perfy.end(label).time;
    let suffix = 's';
    // convert to milliseconds
    if (time < 1) {
      time *= Math.pow(10, 1);
      suffix = 'ms';
    }
    time = `+${time.toFixed(2)}${suffix}`;
    return `${chalk.cyan(time)}`;
  }
}
