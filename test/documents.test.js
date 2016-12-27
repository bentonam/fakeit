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

  await t.context.model.setup();
});

test.todo('without args');

test.todo('build');

test.todo('runData');

test.todo('buildDocument');

test.todo('initializeDocument');

test.todo('buildObject');

test.todo('buildValue');

test.todo('buildArray');

test.todo('buildProcess');

test.todo('buildProcessCallback');

test.todo('getPaths');

test.todo('getPaths');

test.todo('typeToValue');
