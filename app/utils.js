'use strict';

import path from 'path';
import fs from 'fs';

const object_search = (data, pattern, current_path, paths = []) => {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      let test_path = append_path(current_path, i);
      if (test_path.match(pattern) && paths.indexOf(test_path) === -1) {
        paths.push(test_path);
      }
      object_search(data[i], pattern, test_path, paths);
    }
  } else if (typeof data === 'object' && data !== null) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let test_path = append_path(current_path, key);
        if (test_path.match(pattern) && paths.indexOf(test_path) === -1) {
          paths.push(test_path);
        }
        object_search(data[key], pattern, test_path, paths);
      }
    }
  }
  return paths;
};

const append_path = (opath, index) => {
  opath = opath ? opath + '.' + index : '' + index;
  opath = opath.replace(/^\.|\.$|\.{2,}/, '');
  return opath;
};

const exists = (file_path) => new Promise((resolve, reject) => {
  try {
    fs.exists(path.resolve(file_path), (found) => {
      if (found) {
        resolve();
      } else {
        reject(`${file_path} does not exist`);
      }
    });
  } catch (e) {
    reject(e);
  }
});

export default { object_search, exists };
