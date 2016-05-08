'use strict';

import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import csv_stringify from 'csv-stringify';
import yaml from 'yamljs';

let settings, total_entries_to_process, entries_to_process, archive_entries_to_process, archive_entries_processed, archive, archive_out;

// pre run setup / handle settings
const prepare = async (options, resolve, reject, model_documents_count) => {
  // console.log('output.prepare');
  settings = options;
  settings.resolve = resolve;
  settings.reject = reject;

  entries_to_process = model_documents_count;

  set_total_entries_to_process(model_documents_count);

  if (settings.archive) {
    set_archive_entries_to_process();
    await setup_zip(options);
  }
};

const set_total_entries_to_process = () => {
  total_entries_to_process = 0;
  Object.keys(entries_to_process).forEach((v) => {
    total_entries_to_process += entries_to_process[v];
  });
};

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
    archive_out = fs.createWriteStream(path.join(settings.directory, settings.archive));
    archive = archiver('zip');
    archive.pipe(archive_out);
    // event listener to keep track of entries into the zip stream
    archive.on('entry', () => {
      archive_entries_processed += 1;
      if (archive_entries_processed === archive_entries_to_process) {
        // console.log('all zipped entries processed');
        archive.finalize();
      }
    });
    // event listener to handle when the write stream is closed
    archive_out.on('close', () => {
      // only resolve once the stream has been closed
      // console.log('write stream has closed');
      settings.resolve();
    });
    // archive listener to handle errors
    archive.on('error', (err) => {
      settings.reject(err);
      console.log('Archive Error:', err);
    });
    return;
  } catch (e) {
    console.log('Error: setup_zip', e);
  }
};

const save = async (model, documents) => {
  if (settings.archive) { // if we are generating an archive
    await save_archive(model, documents);
  } else if (settings.output === 'csv') { // write model to csv
    await save_csv(model, documents);
  } else { // save output files
    await save_files(model, documents);
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
        filename = documents[i][model.key] + '.' + settings.output;
        result.push(
          format_data(documents[i])
            .then((formatted_data) => append_zip(formatted_data, filename)) // eslint-disable-line no-loop-func
        );
      }
      Promise.all(result)
              .then(resolve);
    }
  } catch (e) {
    console.log('Error: save_archive', e);
    reject(e);
  }
});

const append_zip = (data, entry_name) => new Promise((resolve, reject) => {
  // console.log('output.append_zip');
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
      .then(resolve)
      .catch(reject);
  } catch (e) {
    reject(e);
  }
});

const create_csv = (documents) => new Promise((resolve, reject) => {
  // console.log('create_csv', documents);
  try {
    csv_stringify(documents, { header: true }, (err, transformed_data) => {
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

const write_file = (filename, data) => new Promise((resolve, reject) => {
  try {
    fs.writeFile(path.join(settings.directory, filename), data, (err) => {
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



const flush = async (current_model, data) => {
  return format_data(data)
          .then((formatted_data) => buffer_data(formatted_data))
          .then((buffer) => save(current_model, data, buffer));
};

// create a buffer for the data so it can be written
const buffer_data = (data) => new Promise((resolve, reject) => {
  try {
    console.log('buffer_data');
    resolve(Buffer.from(data));
  } catch (e) {
    console.log('error?');
    reject(e);
  }
});

// error cleanup to delete generated files, etc.
const error_cleanup = () => new Promise((resolve, reject) => {
  // console.log('error_cleanup');
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

export default { prepare, save, flush, error_cleanup };
