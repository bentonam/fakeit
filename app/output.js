'use strict';

import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import documents from './documents';

let settings = {}; // global variable to hold the options + defaults

let archive, archive_out; // global variable to hold zip references
let archive_entries_added = 0;
let archive_entries_processed = 0;

// pre run setup / handle settings
const prepare = async (options, resolve, reject) => {
  // console.log('output.prepare');
  settings = options;
  settings.resolve = resolve;
  settings.reject = reject;

  if (settings.zip) {
    await setup_zip();
  } else {
    // output to the screen
  }
};

// prepare a zip stream for the destination output
const setup_zip = async () => {
  // console.log('output.setup_zip');
  try {
    archive_out = fs.createWriteStream(path.resolve(settings.zip));
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
  if (settings.zip) {
    await append_zip(
      JSON.stringify(data, null, 2),
      data[current_model.key] + '.json'
    );
  }
  return;
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

export default { prepare, flush, error_cleanup };
