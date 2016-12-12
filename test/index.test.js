import Fakeit from '../dist/index.js';
import default_options from '../dist/output/default-options';
import to from 'to-js';
import { stdout } from 'test-console';
import { join as p } from 'path';
import { stripColor } from 'chalk';
import ava from 'ava-spec';
import { without } from 'lodash';

const test = ava.group('fakeit');
const fakeit_root = p(__dirname, 'fixtures', 'models');

/* istanbul ignore next */
const models = require('./utils').models({
  root: fakeit_root,
  // Get the models to test. This is used by the `models` function located at the bottom of this file
  modules: '*/models/*.yaml',
  // this gets the correct validation file to use on a per test basis
  validation(model) {
    return model.replace(/models(.*)\.yaml/g, 'validation$1.data.js');
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
  t.context.fakeit = new Fakeit({
    root: fakeit_root,
    count: 1,
    log: false
  });

  t.context.defaults = to.clone(default_options);
});

test('without args', async (t) => {
  delete t.context.fakeit.options.count;
  t.context.fakeit.options.log = true;
  t.deepEqual(t.context.fakeit.options, {
    root: fakeit_root,
    log: true,
    verbose: false,
    timestamp: true,
  });
  t.is(to.type(t.context.fakeit.documents), 'object');
  t.is(to.type(t.context.fakeit.globals), 'object');
});

const generate = test.group('generate');
generate('generate no models', async (t) => {
  // you can run generate an nothing will happen
  try {
    await t.context.fakeit.generate();
    t.pass();
  } catch (e) {
    t.fail();
  }
});

generate.serial.group('console', models(async (t, model) => {
  t.context.defaults.output = 'console';

  const inspect = stdout.inspect();
  await t.context.fakeit.generate(model, t.context.defaults);
  inspect.restore();

  return to.object(stripColor(inspect.output[0].trim()))[0];
}, null, filterDone()));

generate.group('return', models(async (t, model) => {
  t.context.defaults.output = 'return';
  // var shit = to.object(()[0])
  let actual = await t.context.fakeit.generate(model, t.context.defaults);
  // get the first item in the list of the tests
  // and convert it to an object
  actual = to.object(actual[0]);
  // get the first item in the array to test
  return actual[0];
}, null, filterDone()));

generate.group('folder', models(async (t, model) => {
  t.is(typeof model, 'string');
  t.pass();
}, null, models.files));

generate.group('zip', models(async (t, model) => {
  t.is(typeof model, 'string');
  t.pass();
}, null, models.files));

generate.group('couchbase', models(async (t, model) => {
  t.is(typeof model, 'string');
  t.pass();
}, null, models.files));

generate.group('sync-gateway', models(async (t, model) => {
  t.is(typeof model, 'string');
  t.pass();
}, null, models.files));

// log all the schema keys that still need to be done
test.after(models.todo);
