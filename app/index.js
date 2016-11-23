import path from 'path';
import { prepare } from './input';
import * as models from './models';
import * as output from './output';
import to from 'to-js';

export default function fakeit(options = {}) {
  options = to.extend({
    output: 'console',
    archive: '',
    models: process.cwd(),
    destination: 'console',
    format: 2,
    server: '127.0.0.1',
    bucket: 'default'
  }, options);
  return new Promise((resolve, reject) => {
    // console.log('generator.start');
    validate(options);
    prepare(options)
      .then(() => models.prepare(options))
      .then((model_documents_count) => output.prepare(options, resolve, reject, model_documents_count))
      .then(() => models.generate(options))
      .catch((err) => {
        try {
          output.errorCleanup();
        } finally {
          reject(err);
        }
      });
  });
}

function validate(options) {
  if ('json,cson,csv,yml,yaml'.indexOf(options.output) === -1) { // validate output format
    throw new Error('Unsupported output type');
  } else if (
    options.archive &&
    path.extname(options.archive) !== '.zip'
  ) { // validate archive format
    throw new Error('The archive must be a zip file');
  } else if (
    options.destination === 'couchbase' && (
      !options.server ||
      !options.bucket
    )
  ) { // validate couchbase
    throw new Error('For the server and bucket must be specified when outputting to Couchbase');
  } else if (
    options.destination === 'couchbase' &&
    options.archive
  ) { // validate couchbase
    throw new Error('The archive option cannot be used when the output is couchbase');
  }
}
