/* eslint-disable no-undefined */

import Document, {
  getPaths,
  typeToValue,
} from '../dist/documents.js';
/* istanbul ignore next : needed to test models */
const Model = require('../dist/models.js').default;
import { join as p } from 'path';
import ava from 'ava-spec';
import to from 'to-js';
import _ from 'lodash';
import fs from 'fs-extra-promisify';
const test = ava.group('documents');
const documents_root = p(__dirname, 'fixtures', 'models');
/* istanbul ignore next */
const utils = require('./utils');
const models = utils.models({
  root: documents_root,
  // Get the models to test. This is used by the `models` function located at the bottom of this file
  modules: '*/models/*.yaml',
  // this gets the correct validation file to use on a per test basis
  validation(model) {
    return model.replace(/models(.*)\.yaml/g, 'validation$1.data.js');
  }
});


let babel_config, contents;

test.before(async () => {
  babel_config = await fs.readJson(p(__dirname, '..', '.babelrc'));
  // get the contents of the models store them on an object so it can be reused
  contents = await models.getContents();
});

test.beforeEach(async (t) => {
  t.context.model = new Model({
    root: documents_root,
    log: false,
    babel_config,
  });
  t.context.documents = {};
  t.context.globals = {};
  t.context.inputs = {};
  t.context.document = new Document({
    root: documents_root,
    log: false,
  }, t.context.documents, t.context.globals, t.context.inputs);

  await t.context.model.setup();
});

test('without args', (t) => {
  const doc = t.context.document;
  // rest the log option to what it is by default.
  doc.options.log = true;
  t.deepEqual(doc.options, {
    root: documents_root,
    log: true,
    verbose: false,
    timestamp: true,
  });
  t.is(to.type(doc.log_types), 'object');
  t.deepEqual(doc.documents, {});
  t.deepEqual(doc.globals, {});
  t.deepEqual(doc.inputs, {});
});

test.todo('build');

test.todo('runData');

test.todo('buildDocument');

test.todo('initializeDocument');

test.todo('buildObject');

test.todo('buildValue');

test.todo('buildArray');

test.todo('buildProcess');

test.todo('buildProcessCallback');

test.group('getPaths', models(async (t, file) => {
  await t.context.model.registerModels(file);
  const model = _.find(t.context.model.models, (obj) => {
    return obj.file.includes(file);
  });
  const paths = getPaths(model);

  t.is(to.type(paths), 'object');
  t.deepEqual(to.keys(paths), [ 'model', 'document' ]);
  t.falsy(paths.model.join(',').includes('items.properties'), 'shouldn\'t have an instance of `items.properties`');
  t.falsy(paths.document.join(',').includes('properties.'), 'shouldn\'t have an instance of `properties`');
  t.is(paths.model.length, paths.document.length, 'They should have the same length');
}));

test.group('typeToValue', (test) => {
  const tests = [
    { actual: 'string', expected: '' },
    { actual: 'object', expected: {} },
    { actual: 'structure', expected: {} },
    { actual: 'number', expected: 0 },
    { actual: 'integer', expected: 0 },
    { actual: 'double', expected: 0 },
    { actual: 'long', expected: 0 },
    { actual: 'float', expected: 0 },
    { actual: 'array', expected: [] },
    { actual: 'boolean', expected: false },
    { actual: 'bool', expected: false },
    { actual: 'null', expected: null },
    { actual: 'undefined', expected: null },
  ];

  tests.forEach(({ actual, expected }) => {
    test(actual, (t) => {
      if ('object,structure,array'.includes(actual)) {
        t.deepEqual(typeToValue(actual), expected);
      } else {
        t.is(typeToValue(actual), expected);
      }
    });
  });
});
