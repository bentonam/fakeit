import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import csvStringify from 'csv-stringify';
import yaml from 'yamljs';
import cson from 'cson';
import couchbase from 'couchbase';
import * as utils from './utils';
import request from 'request';
import PromisePool from 'es6-promise-pool';
import cookieParser from 'set-cookie-parser';
import faker from 'faker';
import Chance from 'chance';
const chance = new Chance();

let settings, archive, archive_out, couchbase_bucket, sync_session;

let total_entries_to_process = 0; // the total number of documents to be output
let entries_to_process = {}; // an object with each models document count to output
let models_to_process = 0; // the number of models to be processed
let models_processed = 0; // the number of models that have been processed
let archive_entries_to_process = 0; // the total number of entries to add to the archive before finalizing
let archive_entries_processed = 0; // the number of entries that have been successfully added to the archive

// pre run setup / handle settings
async function prepare({ format, limit, timeout, exclude, ...options }, resolve, reject, model_documents_count) {
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

  setEntriesToProcess(model_documents_count); // save the number of entries for each models documents

  setTotalEntriesToProcess(model_documents_count); // set the total number of entries for all models documents

  if ('console,couchbase,sync-gateway'.indexOf(settings.destination) === -1) {
    // resolve the destination directory
    settings.destination = path.resolve(settings.destination);
    // create any directories that do not exist
    await utils.makeDirectory(settings.destination);
  }

  if (settings.destination === 'couchbase') {
    await setupCouchbase(options)
      .catch((err) => {
        settings.reject(err);
      });
  } else if (settings.destination === 'sync-gateway') {
    await setupSyncgateway(options)
      .catch((err) => {
        settings.reject(err);
      });
  } else if (settings.archive) {
    setArchiveEntriesToProcess();
    await setupZip(options);
  }
}

// updates the entry totals, if a model being generated set new values this would be called
function updateEntryTotals(model_name, number) {
  if (settings.exclude.indexOf(model_name) === -1) {
    let old_entries_to_process = entries_to_process[model_name];
    total_entries_to_process -= old_entries_to_process;
    total_entries_to_process += number;
    // if the entries are being archived and not in csv format updated the archive_entries_to_process
    if (
      settings.archive &&
      settings.output !== 'csv'
    ) {
      archive_entries_to_process = total_entries_to_process;
    }
  }
}

// sets the total number of entries to process
function setEntriesToProcess(entries) {
  // filter out an excluded models from the available models
  Object.keys(entries).forEach((v) => {
    if (settings.exclude.indexOf(v) === -1) {
      entries_to_process[v] = parseInt(entries[v]);
    }
  });
  // save each of the models to be processed
  models_to_process = Object.keys(entries_to_process).length;
}

// sets the total number of entries to process
function setTotalEntriesToProcess() {
  total_entries_to_process = 0;
  Object.keys(entries_to_process).forEach((v) => {
    total_entries_to_process += parseInt(entries_to_process[v]);
  });
}

// sets the number of archive entries to process
function setArchiveEntriesToProcess() {
  if (settings.output === 'csv') { // if we are dealing w/ a csv we will only process the # of model entries
    archive_entries_to_process = Object.keys(entries_to_process).length;
  } else { // otherwise we are dealing with every document for a model
    archive_entries_to_process = total_entries_to_process;
  }
}

// prepare the connection to couchbase
function setupCouchbase() {
  return new Promise((resolve, reject) => {
    // console.log('output.setupCouchbase');
    try {
      const cluster = new couchbase.Cluster(settings.server);
      couchbase_bucket = cluster.openBucket(settings.bucket, settings.password || '', (err) => {
        if (err) {
          reject(err);
        } else if (
          settings.timeout &&
          parseInt(settings.timeout)
        ) {
          couchbase_bucket.operationTimeout = parseInt(settings.timeout);
        }
        // console.log(`Connection to "${settings.bucket}" bucket at "${settings.server}" was successful`);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

// prepare the connection to the sync gateway
function setupSyncgateway() {
  return new Promise((resolve, reject) => {
    // console.log('output.setupSyncgateway');
    try {
      // there might not need to be authentication if the sync db is allowing guest
      if (
        settings.username &&
        settings.password
      ) {
        let options = {
          url: settings.server + '/' + encodeURIComponent(settings.bucket) + '/_session',
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
            if (
              body.ok &&
              res.headers['set-cookie']
            ) {
              let set_cookie = cookieParser.parse(res);
              sync_session = {
                cookie_name: set_cookie[0].name,
                session_id: set_cookie[0].value
              };
              resolve();
            } else if (body.error) {
              reject(body.error);
            } else {
              reject('Unable to connect to Sync Gateway');
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
}

// prepare a zip stream for the destination output
async function setupZip() {
  // console.log('output.setupZip');
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
}

// handles saving a model after a run
function save(model, documents) {
  return new Promise((resolve, reject) => {
    // console.log('output.save');
    try {
      if (settings.exclude.indexOf(model.name) === -1) {
        // console.log(`Saving ${documents.length} documents for ${model.name} model`);
        models_processed += 1; // keep track of the number of models processed
        let result;
        if (settings.archive) { // if we are generating an archive
          saveArchive(model, documents).then(resolve);
        } else {
          if (settings.destination === 'couchbase') { // send the output to couchbase
            result = saveCouchbase(model, documents);
          } else if (settings.destination === 'sync-gateway') {
            result = saveSyncgateway(model, documents);
          } else if (settings.destination === 'console') { // flush the output to the console
            result = flushConsole(model, documents);
          } else if (settings.output === 'csv') { // write model to csv
            result = saveCsv(model, documents);
          } else { // save output files
            result = saveFiles(model, documents);
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
}

// saves each document to a couchbase instance
async function saveCouchbase(model, documents) {
  // console.log('output.saveCouchbase');
  function *generateCalls(docs) { // generator function to handling saving to cb
    for (let i = 0; i < docs.length; i++) {
      yield upsert(docs[i][model.key], docs[i]);
    }
  };

  const iterator = generateCalls(documents); // initialize the generator function
  const pool = new PromisePool(iterator, settings.limit); // create a promise pool
  return await pool.start()
    .catch((err) => {
      settings.reject(err);
    });
}

// upserts a document into couchbase
function upsert(key, data) {
  return new Promise((resolve, reject) => {
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
}

// saves each document to a sync gateway
async function saveSyncgateway(model, documents) {
  // console.log('output.saveSyncgateway');
  function* generateCalls(docs) { // generator function to handling saving to sg
    for (let i = 0; i < docs.length; i++) {
      yield syncgatewaySend(docs[i][model.key], docs[i]);
    }
  };

  const iterator = generateCalls(documents); // initialize the generator function
  const pool = new PromisePool(iterator, settings.limit); // create a promise pool
  return await pool.start()
    .catch((err) => {
      settings.reject(err);
    });
}

function syncgatewaySend(key, data) {
  return new Promise((resolve, reject) => {
    // console.log('output.syncgatewaySend');
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
}

// formats the data based on the output type
function saveArchive(model, documents) {
  return new Promise((resolve, reject) => {
    try {
      let filename, result;
      if (settings.output === 'csv') { // write model to csv
        filename = model.name + '.' + settings.output;
        result = createCsv(documents)
                  .then((formatted_data) => appendZip(formatted_data, filename))
                  .then(resolve);
      } else { // save output files
        result = [];
        for (let i = 0; i < documents.length; i++) {
          result.push(
            formatData(documents[i]) // eslint-disable-line no-loop-func
          );
        }
        Promise.all(result)
                .then((formatted) => {
                  result = [];
                  formatted.forEach((v, i) => {
                    filename = `${getKey(model, documents[i])}.${settings.output}`;
                    result.push(appendZip(v, filename));
                  });
                  return Promise.all(result);
                })
                .then(resolve);
      }
    } catch (e) {
      reject(e);
    }
  });
}

// appends files to the zip archive
function appendZip(data, entry_name) {
  return new Promise((resolve, reject) => {
    // console.log('output.appendZip', entry_name);
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
}

// saves each document to an individual file
async function saveFiles(model, documents) {
  // console.log('saveFiles', documents);
  let writes = [];
  for (let i = 0; i < documents.length; i++) {
    let filename = `${getKey(model, documents[i])}.${settings.output}`;
    writes.push(
      formatData(documents[i])
        .then((formatted_data) => writeFile(filename, formatted_data))
    );
  }
  return Promise.all(writes);
}

// saves each document to an single csv file {
function saveCsv(model, documents) {
  return new Promise((resolve, reject) => {
    // console.log('saveCsv', documents);
    try {
      createCsv(documents)
        .then((transformed_data) => writeFile(model.name + '.' + settings.output, transformed_data))
        .then(finalize)
        .then(resolve)
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

// creates a csv string from the documents
function createCsv(documents) {
  return new Promise((resolve, reject) => {
    // console.log('output.createCsv');
    try {
      csvStringify(documents, { header: true, quotedString: true }, (err, transformed_data) => {
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
}

// creates a csv string from the documents
function flushConsole(model, documents) {
  return new Promise((resolve, reject) => {
    // console.log('output.flushConsole');
    try {
      let writes = [];
      if (settings.output === 'csv') {
        writes.push(createCsv(documents));
      } else {
        documents.forEach((d) => {
          writes.push(
            formatData(d)
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
}

// determines whether or not the entire generation can be finalized
async function finalize() {
  // console.log('output.finalize');
  if (!settings.archive) { // if we are generating an archive
    if (models_to_process === models_processed) {
      if (
        !settings.destination === 'couchbase' &&
        couchbase_bucket.connected
      ) {
        couchbase_bucket.disconnect();
      }
      settings.resolve();
    }
  }
}

// formats the data based on the output type
function formatData(data) {
  return new Promise((resolve, reject) => {
    try {
      if (settings.output === 'json') {
        resolve(JSON.stringify(data, null, settings.format));
      } else if (
        settings.output === 'yaml' ||
        settings.output === 'yml'
      ) {
        resolve(yaml.stringify(data, settings.format));
      } else if (settings.output === 'cson') {
        resolve(cson.stringify(data, null, settings.format));
      }
    } catch (e) {
      reject(e);
    }
  });
}

// handles writing a file to disk
function writeFile(filename, data) {
  return new Promise((resolve, reject) => {
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
}

// error cleanup to delete generated files, etc.
function errorCleanup() {
  return new Promise((resolve, reject) => {
    // console.log('output.errorCleanup');
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
      } else if (
        settings.destination === 'couchbase' &&
        couchbase_bucket.connected
      ) {
        couchbase_bucket.disconnect();
      }
    } catch (e) {
      reject(e);
    }
  });
}

// gets the key for a document
function getKey(model, doc) {
  // console.log('output.getKey');
  let key;
  if (model.key.build) {
    key = model.key.build.apply(doc, [ null, null, null, faker, chance, null ]);
  } else {
    key = doc[model.key];
  }
  return key;
}

export default { prepare, save, updateEntryTotals, errorCleanup };
