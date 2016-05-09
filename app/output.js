'use strict';

import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import csv_stringify from 'csv-stringify';
import yaml from 'yamljs';

let settings, archive, archive_out;

let total_entries_to_process = 0; // the total number of documents to output
let entries_to_process = {}; // an object with each models document count to output
let models_to_process = 0; // the number of models to be processed
let models_processed = 0; // the number of models that have been processed
let archive_entries_to_process = 0; // the total number of entries to add to the archive before finalizing
let archive_entries_processed = 0; // the number of entries that have been successfully added to the archive

// pre run setup / handle settings
const prepare = async (options, resolve, reject, model_documents_count) => {
  // console.log('output.prepare');
  settings = options;
  settings.resolve = resolve;
  settings.reject = reject;

  settings.format = parseInt(settings.format); // ensure that the spacing is a number

  // save the number of entries for each models documents
  entries_to_process = model_documents_count;
  models_to_process = Object.keys(entries_to_process).length;

  set_total_entries_to_process(model_documents_count);

  if (settings.archive) {
    set_archive_entries_to_process();
    await setup_zip(options);
  }
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
  try {
    models_processed += 1; // keep track of the number of models processed
    let result;
    if (settings.archive) { // if we are generating an archive
      save_archive(model, documents).then(resolve);
    } else {
      if (settings.destination === 'console') { // flush the output to the console
        result = flush_console(model, documents);
      } else if (settings.output === 'csv') { // write model to csv
        result = save_csv(model, documents);
      } else { // save output files
        result = save_files(model, documents);
      }
      result.then(finalize).then(resolve);
    }
  } catch (e) {
    reject(e);
  }
});

// determines whether or not the entire generation can be finalized
const finalize = async () => {
  if (!settings.archive) { // if we are generating an archive
    if (models_to_process === models_processed) {
      settings.resolve();
    }
  }
};

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
  return Promise.all(writes).then(finalize);
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
  // console.log('output.create_csv');
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

// formats the data based on the output type
const format_data = (data) => new Promise((resolve, reject) => {
  try {
    if (settings.output === 'json') {
      resolve(JSON.stringify(data, null, settings.format));
    } else if (settings.output === 'yaml' || settings.output === 'yml') {
      resolve(yaml.stringify(data, settings.format));
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
    if (settings.zip) {
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
    }
  } catch (e) {
    reject(e);
  }
});

export default { prepare, save, error_cleanup };
