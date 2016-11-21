import path from 'path';
import globby from 'globby';
import { map } from 'async-array-methods';
import to from 'to-js';
import AdmZip from 'adm-zip';
import fs from 'fs-extra-promisify';

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

/// @name findFiles
/// @description
/// This is a very efficient way to to recursively read a directory and get all the files.
/// @arg {string, array} dirs - The dir or dirs you want to get all the files from
/// @returns {array} All the files in the directory(s) that were passed
/// @async
export async function findFiles(dirs) {
  // all the files after
  const files = [];
  const sort = (list) => {
    const to_search = [];
    list = to.flatten(list);
    for (let item of list) {
      if (!!path.extname(item)) {
        files.push(item);
      } else {
        to_search.push(item);
      }
    }
    return to_search;
  };
  const find = async (folders) => {
    folders = sort(await map(folders, (folder) => globby(path.join(folder, '*'))));
    if (folders.length) {
      return find(folders);
    }
  };

  await find(to.array(dirs));
  return files;
}


/// @name readFiles
/// @description
/// This will read all the files that have been passed to it and return them in an array of objects.
/// @arg {string, array} files - The files to read. This can be any file including `zip`.
/// @returns {array} An `array` of files where each object will have the following information
///
/// ```js
/// {
///   path: '', // the full path of the file
///   content: '', // the contents of the file as a string
///   // the rest of the keys are the same as what you would get from running `path.parse`
///   root: '',
///   dir: '',
///   base: '',
///   ext: '',
///   name: '',
/// }
/// ```
/// @async
export async function readFiles(files) {
  if (!files) return;

  files = to.array(files);

  files = await map(files, async (file) => {
    file = path.resolve(file); // resolve the full path
    let info = path.parse(file); // parse the full path to get the name and extension
    if (info.ext === '.zip') {
      const zip = new AdmZip(file);
      return map(zip.getEntries(), async (entry) => {
        if (!entry.isDirectory && !entry.entryName.match(/^(\.|__MACOSX)/)) {
          let file_info = path.parse(entry.entryName); // eslint-disable-line
          file_info.path = entry.entryName;
          file_info.content = await zip.readAsText(entry.entryName);
          return file_info;
        }
      });
    }

    info.path = file;
    info.content = to.string(await fs.readFile(file));
    return info;
  });


  return to.flatten(files);
}
