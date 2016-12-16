import Models from '../dist/models.js';
import { join as p } from 'path';
import path, { join as p } from 'path';
import ava from 'ava-spec';
import to from 'to-js';
import is from 'joi';
import { without } from 'lodash';
import fs from 'fs-extra-promisify';

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


// log all the schema keys that still need to be done
test.after(models.todo);
