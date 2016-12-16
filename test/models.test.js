/* eslint-disable no-undefined */

import Models, {
  parseModelInputs,
} from '../dist/models.js';
import path, { join as p } from 'path';
import ava from 'ava-spec';
import to from 'to-js';
import is from 'joi';
import { without } from 'lodash';
import fs from 'fs-extra-promisify';
import AdmZip from 'adm-zip';

const test = ava.group('models');
const models_root = p(__dirname, 'fixtures', 'models');

/* istanbul ignore next */
const models = require('./utils').models({
  root: models_root,
  // Get the models to test. This is used by the `models` function located at the bottom of this file
  modules: '*/models/*.yaml',
  // this gets the correct validation file to use on a per test basis
  validation(model) {
    return model.replace(/models(.*)\.yaml/g, 'validation$1.model.js');
  }
});

const done = [
  p('contacts', 'models', 'contacts.yaml'),
  p('music', 'models', 'countries.yaml')
];

function filterDone() {
  return without(models.files, ...done);
}

let babel_config, contents;

test.before(async () => {
  babel_config = await fs.readJson(p(__dirname, '..', '.babelrc'));
  // get the contents of the models store them on an object so it can be reused
  contents = await models.getContents();
});

test.beforeEach((t) => {
  t.context = new Models({
    root: models_root,
    log: false
  });
});

test('without args', async (t) => {
  t.context.options.log = true;
  const { error } = is.object({
    options: is.object({
      babel_config: is.string().regex(/\+\(\.babelrc\|package\.json\)/),
    })
      .unknown()
      .required(),
    log_types: is.object().required(),
    inputs: is.object().length(0),
    models: is.array().length(0),
    prepared: is.boolean(),
  })
    .validate(t.context);
  if (error) {
    t.fail(error);
  } else {
    t.pass();
  }
});

test('prepare', async (t) => {
  t.is(t.context.prepared, false);
  t.is(t.context.preparing, undefined);
  t.is(typeof t.context.options.babel_config, 'string');
  const preparing = t.context.prepare();
  t.is(typeof t.context.preparing.then, 'function');
  t.is(t.context.prepared, false);
  await preparing;
  t.is(t.context.prepared, true);
  t.is(typeof t.context.options.babel_config, 'object');
  t.deepEqual(t.context.options.babel_config, babel_config);
});

test('setup', async (t) => {
  t.is(t.context.prepared, false);
  t.is(t.context.preparing, undefined);
  t.is(typeof t.context.options.babel_config, 'string');
  const preparing = t.context.setup();
  t.is(typeof t.context.preparing.then, 'function');
  t.is(t.context.prepared, false);
  await preparing;
  t.is(t.context.prepared, true);
  t.is(typeof t.context.options.babel_config, 'object');
  t.deepEqual(t.context.options.babel_config, babel_config);
});

test('registerModels without args', async (t) => {
  // you can run registerModels and nothing will happen
  try {
    await t.context.registerModels();
    t.pass();
  } catch (e) {
    t.fail();
  }
});

test.group('registerModels', models(async (t, model) => {
  await t.context.registerModels(model);
  return t.context.models[0];
}, null, filterDone()));

test.group('parseModelInputs', models(async (t, file) => {
  t.deepEqual(to.keys(t.context.inputs).length, 0);
  const model = contents[file];

  let files = model.data.inputs = t.context.resolvePaths(model.data.inputs, path.resolve(t.context.options.root, path.dirname(file)));
  files = files.map((str) => {
    if (!/.*\.zip/.test(str)) return str;
    const zip = new AdmZip(str);
    return zip.getEntries().map((entry) => {
      if (!entry.isDirectory && !entry.entryName.match(/^(\.|__MACOSX)/)) {
        return entry.entryName;
      }
    });
  });
  files = to.flatten(files).filter(Boolean);

  const expected = files.reduce((prev, next) => {
    prev[path.basename(next).split('.')[0]] = is.any().allow(is.array(), is.object());
    return prev;
  }, {});

  const actual = await parseModelInputs(model);

  const tests = [ t.context.inputs, actual, model.data.inputs ];

  for (let item of tests) {
    const { error } = is.object(expected).validate(item);
    if (error) {
      t.fail(error);
    } else {
      t.pass();
    }
  }
}));


// log all the schema keys that still need to be done
test.after(models.todo);
