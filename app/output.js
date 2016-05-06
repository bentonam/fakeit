'use strict';

import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import documents from './documents';
import csv from 'csv';

let settings = {}; // global variable to hold the options + defaults

let archive_entries_added = 0;
let archive_entries_processed = 0;
let entries_to_process = 0;

let output_format = '';

let archive, archive_out, csv_stringifier;

// pre run setup / handle settings
const prepare = async (options, resolve, reject) => {
  // console.log('output.prepare');
  settings = options;
  settings.resolve = resolve;
  settings.reject = reject;

  if (settings.output) {
    output_format = path.extname(settings.output).replace(/^\./, '') || settings.output;
  }

  if (output_format === 'zip') {
    await setup_zip();
  } else if (output_format === 'csv') {
    await setup_csv();
  }
};

// prepare a csv stream for the destination output
const setup_csv = async () => {
  // console.log('output.setup_zip');
  try {
    archive_out = fs.createWriteStream(path.resolve(settings.output));
    csv_stringifier = csv.stringify();
    csv_stringifier.on('readable', () => {
      let data = csv_stringifier.read();
      while (data) {
        archive_out.write(data);
        data = csv_stringifier.read();
        archive_entries_processed += 1;
        if (archive_entries_processed === entries_to_process) {
          csv_stringifier.end();
        }
      }
    });

    csv_stringifier.on('finish', () => {
      archive_out.end();
    });

    // event listener to handle when the write stream is closed
    archive_out.on('close', () => {
      // only resolve once the stream has been closed
      // console.log('write stream has closed');
      settings.resolve(documents.get_stats());
    });

    return;
  } catch (e) {
    console.log('Error: setup_csv', e);
  }
};

// prepare a zip stream for the destination output
const setup_zip = async () => {
  // console.log('output.setup_zip');
  try {
    archive_out = fs.createWriteStream(path.resolve(settings.output));
    archive = archiver('zip');
    archive.pipe(archive_out);
    // event listener to keep track of entries into the zip stream
    archive.on('entry', () => {
      archive_entries_processed += 1;
      if (archive_entries_processed === archive_entries_added) {
        // console.log('all zipped entries processed');
        archive.finalize();
      }
    });
    // event listener to handle when the write stream is closed
    archive_out.on('close', () => {
      // only resolve once the stream has been closed
      // console.log('write stream has closed');
      settings.resolve(documents.get_stats());
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

const flush = async (current_model, data) => {
  // if we are archiving (zipping) the results
  if (settings.archive) {
    await flush_archive(current_model, data);
  } else { // if we are just writing out files
    await flush_file(current_model, data);
  }
};

const flush_file = async (current_model, data) => {
  // if we are just writing the output to files
  if (output_format === 'json') {
    fs.writeFile(
      path.join(path.resolve(settings.directory || process.cwd()), data[current_model.key] + '.json'), // json files will use the key as the file name
      JSON.stringify(data, null, 2)
    );
  } else if (output_format === 'csv') {
    await append_csv(data);
  }
};

const flush_archive = async (current_model, data) => {
  // if we are archiving (zipping) the results
  if (output_format === 'json') {
    await append_zip(
      JSON.stringify(data, null, 2),
      data[current_model.key] + '.json'
    );
  }
  return;
};

const append_csv = async (data) => {
  try {
    if (!archive_entries_added) { // add the header if no entries have been previously added
      entries_to_process += 1; // since we are adding the headers we need a faux entry
      csv_stringifier.write(
        Object.keys(data)
      );
    }
    archive_entries_added += 1;
    csv_stringifier.write(
      data
    );
    return data;
  } catch (e) {
    throw e;
  }
};

const append_zip = async (data, entry_name) => {
  try {
    archive_entries_added += 1;
    archive.append(
      data,
      {
        name: entry_name
      }
    );
    return data;
  } catch (e) {
    throw e;
  }
};

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

const set_entries_to_process = (number) => {
  entries_to_process = number;
};

export default { prepare, flush, error_cleanup, set_entries_to_process };
