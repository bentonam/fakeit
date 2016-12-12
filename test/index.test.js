import Fakeit from '../dist/index.js';
import default_options from '../dist/output/default-options';
import to from 'to-js';
import { stdout } from 'test-console';
import { join as p } from 'path';
import chalk, { stripColor } from 'chalk';
import ava from 'ava-spec';

const test = ava.group('fakeit');
const fakeit_root = p(__dirname, 'fixtures', 'models');

// holds the schemas that still need to have validation on them on a per model basis
const schemas_todo = {};

/* istanbul ignore next */
const models = require('./utils').models({
  schemas_todo,
  root: fakeit_root,
  // Get the models to test. This is used by the `models` function located at the bottom of this file
  modules: '*/models/*.yaml',
  // this gets the correct validation file to use on a per test basis
  validation(model) {
    return model.replace(/models(.*)\.yaml/g, 'validation$1.data.js');
  }
});

test.beforeEach((t) => {
  t.context.fakeit = new Fakeit({
    root: fakeit_root,
    count: 1,
    log: false
  });

  t.context.defaults = to.clone(default_options);
});

test('without args', async (t) => {
  t.context.fakeit.options.log = true;
  t.deepEqual(t.context.fakeit.options, {
    inputs: '',
    exclude: '',
    count: 1,
    root: fakeit_root,
    log: true,
    verbose: false,
    timestamp: true,
  });
  t.is(to.type(t.context.fakeit.documents), 'object');
  t.is(to.type(t.context.fakeit.globals), 'object');
  t.is(to.type(t.context.fakeit.inputs), 'object');
  t.is(to.type(t.context.fakeit.models), 'array');
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
}, null, models.files.slice(1)));

generate.serial.group('return', models(async (t, model) => {
  t.context.defaults.output = 'return';
  // var shit = to.object(()[0])
  let actual = await t.context.fakeit.generate(model, t.context.defaults);
  // get the first item in the list of the tests
  // and convert it to an object
  actual = to.object(actual[0]);
  // get the first item in the array to test
  return actual[0];
}, null, models.files.slice(1)));

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

test.after(() => {
  // log all the schema keys that still need to be done
  for (var schema in schemas_todo) {
    if (schemas_todo.hasOwnProperty(schema)) {
      for (let key of schemas_todo[schema]) {
        console.log(chalk.blue(`  - ${schema}: ${key}`).toString());
      }
    }
  }
});
