'use strict';

// import couchbase from 'couchbase';
import models from './models';
import output from './output';

const defaults = {
  zip: '',
  server: '127.0.0.1',
  bucket: 'default',
  password: ''
};

const start = (options = defaults) => new Promise((resolve, reject) => {
  try {
    // console.log('start');
    output.prepare(options, resolve, reject)
      .then(models.prepare)
      .then(models.generate)
      .catch((err) => {
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

export default { start };
