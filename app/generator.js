'use strict';

// import couchbase from 'couchbase';
import path from 'path';
import utils from './utils';
import models from './models';
import output from './output';

const defaults = {
  models: process.cwd(),
  output: 'console',
  archive: '',
  directory: process.cwd(),
  server: '127.0.0.1',
  bucket: 'default',
  password: ''
};

const start = (options = defaults) => new Promise((resolve, reject) => {
  try {
    // console.log('start');
    validate(options)
      .then(() => models.prepare(options))
      .then((model_documents_count) => output.prepare(options, resolve, reject, model_documents_count))
      .then(models.generate)
      .catch((err) => {
        console.log(err);
        output.error_cleanup()
          .then(() => {
            reject(err);
          })
          .catch(() => {
            reject(err);
          });
      });
  } catch (e) {
    reject(e);
  }
});

const validate = (options) => new Promise((resolve, reject) => {
  if ('console,json,csv,yaml'.indexOf(options.output) === -1) { // validate output format
    reject('Unsupported output type');
  } else if (options.archive && path.extname(options.archive) !== '.zip') { // validate archive format
    reject('The archive must be a zip file');
  } else if (options.directory) { // validate output directory exists
    utils.exists(path.resolve(options.directory))
      .then(() => resolve())
      .catch((err) => reject(err));
  } else {
    resolve();
  }
});

export default { start };
