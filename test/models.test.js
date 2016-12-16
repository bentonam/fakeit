import Models from '../dist/models.js';
import { join as p } from 'path';
import ava from 'ava-spec';
import { without } from 'lodash';

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

test.beforeEach((t) => {
  t.context = new Models({
    root: models_root,
    log: false
  });
});

test('without args', async (t) => {
  t.context.options.log = true;
  t.deepEqual(t.context.options, {
    root: models_root,
    log: true,
    verbose: false,
    timestamp: true,
  });
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
