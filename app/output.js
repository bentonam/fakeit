'use strict';

import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import csv_stringify from 'csv-stringify';
import yaml from 'yamljs';
import cson from 'cson';
import couchbase from 'couchbase';
import utils from './utils';
import request from 'request';
import PromisePool from 'es6-promise-pool';

let settings, archive, archive_out, couchbase_bucket, sync_session;

let total_entries_to_process = 0; // the total number of documents to be output
let entries_to_process = {}; // an object with each models document count to output
let models_to_process = 0; // the number of models to be processed
let models_processed = 0; // the number of models that have been processed
let archive_entries_to_process = 0; // the total number of entries to add to the archive before finalizing
let archive_entries_processed = 0; // the number of entries that have been successfully added to the archive

// pre run setup / handle settings
const prepare = async ({ format, limit, timeout, exclude, ...options }, resolve, reject, model_documents_count) => {
  // console.log('output.prepare');
  settings = {
    ...options,
    resolve,
    reject,
    format: typeof format !== 'undefined' && !isNaN(parseInt(format)) ? parseInt(format) : 2, // ensure that the spacing is a number
    limit: parseInt(limit) || 1000, // ensure that the limit is a number
    timeout: parseInt(timeout) || 5000, // ensure that the timeout is a number
    exclude: exclude.split(',')
  };

  set_entries_to_process(model_documents_count); // save the number of entries for each models documents

  set_total_entries_to_process(model_documents_count); // set the total number of entries for all models documents

  if ('console,couchbase,sync-gateway'.indexOf(settings.destination) === -1) {
    // resolve the destination directory
    settings.destination = path.resolve(settings.destination);
    // create any directories that do not exist
    await utils.make_directory(settings.destination);
  }

  if (settings.destination === 'couchbase') {
    await setup_couchbase(options)
            .catch((err) => {
              settings.reject(err);
            });
  } else if (settings.destination === 'sync-gateway') {
    await setup_syncgateway(options)
            .catch((err) => {
              settings.reject(err);
            });
  } else if (settings.archive) {
    set_archive_entries_to_process();
    await setup_zip(options);
  }
};

// updates the entry totals, if a model being generated set new values this would be called
const update_entry_totals = (model_name, number) => {
  if (settings.exclude.indexOf(model_name) === -1) {
    let old_entries_to_process = entries_to_process[model_name];
    total_entries_to_process -= old_entries_to_process;
    total_entries_to_process += number;
    // if the entries are being archived and not in csv format updated the archive_entries_to_process
    if (settings.archive && settings.output !== 'csv') {
      archive_entries_to_process = total_entries_to_process;
    }
  }
};

// sets the total number of entries to process
const set_entries_to_process = (entries) => {
  // filter out an excluded models from the available models
  Object.keys(entries).forEach((v) => {
    if (settings.exclude.indexOf(v) === -1) {
      entries_to_process[v] = parseInt(entries[v]);
    }
  });
  // save each of the models to be processed
  models_to_process = Object.keys(entries_to_process).length;
};

// sets the total number of entries to process
const set_total_entries_to_process = () => {
  total_entries_to_process = 0;
  Object.keys(entries_to_process).forEach((v) => {
    total_entries_to_process += parseInt(entries_to_process[v]);
  });
};

// sets the number of archive entries to process
const set_archive_entries_to_process = () => {
  if (settings.output === 'csv') { // if we are dealing w/ a csv we will only process the # of model entries
    archive_entries_to_process = Object.keys(entries_to_process).length;
  } else { // otherwise we are dealing with every document for a model
    archive_entries_to_process = total_entries_to_process;
  }
};

// prepare the connection to couchbase
const setup_couchbase = () => new Promise((resolve, reject) => {
  // console.log('output.setup_couchbase');
  try {
    const cluster = new couchbase.Cluster(settings.server);
    couchbase_bucket = cluster.openBucket(settings.bucket, settings.password || '', (err) => {
      if (err) {
        reject(err);
      } else {
        if (settings.timeout && parseInt(settings.timeout)) {
          couchbase_bucket.operationTimeout = parseInt(settings.timeout);
        }
        // console.log(`Connection to "${settings.bucket}" bucket at "${settings.server}" was successful`);
        resolve();
      }
    });
  } catch (e) {
    reject(e);
  }
});

// prepare the connection to the sync gateway
const setup_syncgateway = () => new Promise((resolve, reject) => {
  // console.log('output.setup_syncgateway');
  try {
    // there might not need to be authentication if the sync db is allowing guest
    if (settings.sync_gateway_admin && settings.username && settings.password) {
      let options = {
        url: settings.sync_gateway_admin + '/' + settings.bucket + '/_session',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: settings.username, password: settings.password })
      };
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          body = JSON.parse(body);
          if (body.error) {
            reject(body.error);
          } else {
            sync_session = body;
            resolve();
          }
        }
      });
    } else {
      resolve();
    }
  } catch (e) {
    reject(e);
  }
});

// prepare a zip stream for the destination output
const setup_zip = async () => {
  // console.log('output.setup_zip');
  try {
    archive_entries_processed = 0;
    archive_out = fs.createWriteStream(path.join(settings.destination, settings.archive));
    archive = archiver('zip');
    archive.pipe(archive_out);
    // event listener to keep track of entries into the zip stream
    archive.on('entry', () => {
      archive_entries_processed += 1;
      if (archive_entries_processed === archive_entries_to_process) {
        // if we have processed all the zip entries, finalize the archive so the write stream
        // can be closed and we can resolve the promise
        archive.finalize();
      }
    });
    // event listener to handle when the write stream is closed
    archive_out.on('close', () => {
      // only resolve once the stream has been closed
      settings.resolve();
    });
    // archive listener to handle errors
    archive.on('error', (err) => {
      settings.reject(err);
    });
  } catch (e) {
    settings.reject(e);
  }
};

// handles saving a model after a run
const save = (model, documents) => new Promise((resolve, reject) => {
  // console.log('output.save');
  try {
    if (settings.exclude.indexOf(model.name) === -1) {
      // console.log(`Saving ${documents.length} documents for ${model.name} model`);
      models_processed += 1; // keep track of the number of models processed
      let result;
      if (settings.archive) { // if we are generating an archive
        save_archive(model, documents).then(resolve);
      } else {
        if (settings.destination === 'couchbase') { // send the output to couchbase
          result = save_couchbase(model, documents);
        } else if (settings.destination === 'sync-gateway') {
          result = save_syncgateway(model, documents);
        } else if (settings.destination === 'console') { // flush the output to the console
          result = flush_console(model, documents);
        } else if (settings.output === 'csv') { // write model to csv
          result = save_csv(model, documents);
        } else { // save output files
          result = save_files(model, documents);
        }
        result.then(finalize).then(resolve);
      }
    } else {
      resolve();
    }
  } catch (e) {
    reject(e);
  }
});

// saves each document to a couchbase instance
const save_couchbase = async (model, documents) => {
  // console.log('output.save_couchbase');
  const generate_calls = function * (docs) { // generator function to handling saving to cb
    for (let i = 0; i < docs.length; i++) {
      yield upsert(docs[i][model.key], docs[i]);
    }
  };

  const iterator = generate_calls(documents); // initialize the generator function
  const pool = new PromisePool(iterator, settings.limit); // create a promise pool
  return await pool.start()
                  .catch((err) => {
                    settings.reject(err);
                  });
};

// upserts a document into couchbase
const upsert = (key, data) => new Promise((resolve, reject) => {
  // console.log('output.upsert');
  try {
    couchbase_bucket.upsert(key.toString(), data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  } catch (e) {
    reject(e);
  }
});

// saves each document to a sync gateway
const save_syncgateway = async (model, documents) => {
  // console.log('output.save_syncgateway');
  const generate_calls = function * (docs) { // generator function to handling saving to sg
    for (let i = 0; i < docs.length; i++) {
      yield syncgateway_send(docs[i][model.key], docs[i]);
    }
  };

  const iterator = generate_calls(documents); // initialize the generator function
  const pool = new PromisePool(iterator, settings.limit); // create a promise pool
  return await pool.start()
                  .catch((err) => {
                    settings.reject(err);
                  });
};

const syncgateway_send = (key, data) => new Promise((resolve, reject) => {
  // console.log('output.syncgateway_send');
  try {
    let options = {
      url: settings.server + '/' + settings.bucket + '/' + encodeURIComponent(key),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    // if there is a an authenticated sync session use it
    if (sync_session) {
      let jar = request.jar();
      let cookie = request.cookie(sync_session.cookie_name + '=' + sync_session.session_id);
      jar.setCookie(cookie, settings.server);
      options.jar = jar;
    }
    request(options, (err, res, body) => {
      if (err) {
        reject();
      } else {
        body = JSON.parse(body);
        if (body.error) {
          if (body.reason === 'Document exists') {
            body.reason = `The '${key}' document exists`;
          }
          reject(new Error(body.reason));
        } else {
          resolve();
        }
      }
    });
  } catch (e) {
    reject(e);
  }
});

// formats the data based on the output type
const save_archive = (model, documents) => new Promise((resolve, reject) => {
  try {
    let filename, result;
    if (settings.output === 'csv') { // write model to csv
      filename = model.name + '.' + settings.output;
      result = create_csv(documents)
                .then((formatted_data) => append_zip(formatted_data, filename))
                .then(resolve);
    } else { // save output files
      result = [];
      for (let i = 0; i < documents.length; i++) {
        result.push(
          format_data(documents[i]) // eslint-disable-line no-loop-func
        );
      }
      Promise.all(result)
              .then((formatted) => {
                result = [];
                formatted.forEach((v, i) => {
                  filename = documents[i][model.key] + '.' + settings.output;
                  result.push(append_zip(v, filename));
                });
                return Promise.all(result);
              })
              .then(resolve);
    }
  } catch (e) {
    reject(e);
  }
});

// appends files to the zip archive
const append_zip = (data, entry_name) => new Promise((resolve, reject) => {
  // console.log('output.append_zip', entry_name);
  try {
    archive.append(
      data,
      {
        name: entry_name
      }
    );
    resolve();
  } catch (e) {
    reject(e);
  }
});

// saves each document to an individual file
const save_files = async (model, documents) => {
  // console.log('save_files', documents);
  var writes = [];
  for (let i = 0; i < documents.length; i++) {
    let filename = documents[i][model.key] + '.' + settings.output;
    writes.push(
      format_data(documents[i])
        .then((formatted_data) => write_file(filename, formatted_data))
    );
  }
  return Promise.all(writes);
};

// saves each document to an single csv file {
const save_csv = (model, documents) => new Promise((resolve, reject) => {
  // console.log('save_csv', documents);
  try {
    create_csv(documents)
      .then((transformed_data) => write_file(model.name + '.' + settings.output, transformed_data))
      .then(finalize)
      .then(resolve)
      .catch(reject);
  } catch (e) {
    reject(e);
  }
});

// creates a csv string from the documents
const create_csv = (documents) => new Promise((resolve, reject) => {
  // console.log('output.create_csv');
  try {
    csv_stringify(documents, { header: true, quotedString: true }, (err, transformed_data) => {
      if (err) {
        reject(err);
      } else {
        resolve(transformed_data);
      }
    });
  } catch (e) {
    reject(e);
  }
});

// creates a csv string from the documents
const flush_console = (model, documents) => new Promise((resolve, reject) => {
  // console.log('output.flush_console');
  try {
    let writes = [];
    if (settings.output === 'csv') {
      writes.push(create_csv(documents));
    } else {
      documents.forEach((d) => {
        writes.push(
          format_data(d)
        );
      });
    }
    Promise.all(writes)
      .then((result) => {
        result.forEach((v) => {
          console.log(v);
        });
      })
      .then(resolve);
  } catch (e) {
    reject(e);
  }
});

// determines whether or not the entire generation can be finalized
const finalize = async () => {
  // console.log('output.finalize');
  if (!settings.archive) { // if we are generating an archive
    if (models_to_process === models_processed) {
      if (!settings.destination === 'couchbase' && couchbase_bucket.connected) {
        couchbase_bucket.disconnect();
      }
      settings.resolve();
    }
  }
};

// formats the data based on the output type
const format_data = (data) => new Promise((resolve, reject) => {
  try {
    if (settings.output === 'json') {
      resolve(JSON.stringify(data, null, settings.format));
    } else if (settings.output === 'yaml' || settings.output === 'yml') {
      resolve(yaml.stringify(data, settings.format));
    } else if (settings.output === 'cson') {
      resolve(cson.stringify(data, null, settings.format));
    }
  } catch (e) {
    reject(e);
  }
});

// handles writing a file to disk
const write_file = (filename, data) => new Promise((resolve, reject) => {
  try {
    fs.writeFile(path.join(settings.destination, filename), data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  } catch (e) {
    reject(e);
  }
});

// error cleanup to delete generated files, etc.
const error_cleanup = () => new Promise((resolve, reject) => {
  // console.log('output.error_cleanup');
  try {
    if (settings.archive) {
      // prevent the close method from being called to the generation is not resolved
      archive_out.removeAllListeners('close');
      // attach a new close event to delete the zip file
      archive_out.on('close', () => {
        fs.unlink(archive_out.path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else if (settings.destination === 'couchbase') {
      couchbase_bucket.connected && couchbase_bucket.disconnect();
    }
  } catch (e) {
    reject(e);
  }
});

export default { prepare, save, update_entry_totals, error_cleanup };
