import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

export function objectSearch(data, pattern, current_path, paths = []) {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      let test_path = appendPath(current_path, i);
      if (
        test_path.match(pattern) &&
        paths.indexOf(test_path) === -1
      ) {
        paths.push(test_path);
      }
      objectSearch(data[i], pattern, test_path, paths);
    }
  } else if (
    typeof data === 'object' &&
    data !== null
  ) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let test_path = appendPath(current_path, key);
        if (
          test_path.match(pattern) &&
          paths.indexOf(test_path) === -1
        ) {
          paths.push(test_path);
        }
        objectSearch(data[key], pattern, test_path, paths);
      }
    }
  }
  return paths;
}

function appendPath(opath, index) {
  opath = opath ? opath + '.' + index : '' + index;
  opath = opath.replace(/^\.|\.$|\.{2,}/, '');
  return opath;
}

export function exists(file_path) {
  return new Promise((resolve, reject) => {
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
}

export function isDirectory(dir_path) {
  return new Promise((resolve, reject) => {
    try {
      dir_path = path.resolve(dir_path);
      fs.stat(dir_path, (err, stats) => {
        if (err || !stats.isDirectory()) {
          reject();
        } else {
          resolve(dir_path);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function readDirectory(dir_path) {
  return new Promise((resolve, reject) => {
    try {
      fs.readdir(dir_path, (err, files) => {
        if (err) {
          throw err;
        } else {
          files = files.map((current) => {
            return path.join(dir_path, current);
          });
          resolve(files);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function readFile(file_path) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(file_path, (err, data) => {
        if (err) {
          throw err;
        } else {
          resolve(data.toString());
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function makeDirectory(dir_path) {
  return new Promise((resolve, reject) => {
    try {
      mkdirp(dir_path, (err) => {
        if (err) {
          throw err;
        } else {
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
