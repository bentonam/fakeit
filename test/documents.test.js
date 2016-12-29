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
import is from 'joi';
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

test.group('initializeDocument', (test) => {
  test('throws if wrong paths were passed in', (t) => {
    // highjack the log function
    t.context.document.log = (type, message) => {
      if (type === 'error') {
        throw new Error(message);
      }
    };
    const tester = () => t.context.document.initializeDocument({}, { model: [ 'a' ], document: [ 'a' ] });
    t.throws(tester);
  });

  test.group(models(async (t, file) => {
    await t.context.model.registerModels(file);
    const model = _.find(t.context.model.models, (obj) => {
      return obj.file.includes(file);
    });

    const doc = t.context.document.initializeDocument(model);
    t.deepEqual(to.keys(doc), to.keys(model.properties));
    function get(key) {
      let result = _.get(model, `properties.${key}`);
      if (!result) {
        result = _.get(model, `properties.${key.split('.').join('.properties.')}`);
      }
      if (result) {
        return typeToValue(result.type);
      }
      return null;
    }

    const keys = utils.getPaths(doc);

    for (let key of keys) {
      const expected = get(key);
      const actual = _.get(doc, key);
      const type = to.type(actual);
      if (type !== 'object') {
        if (type === 'array') {
          t.deepEqual(actual, expected);
        } else {
          t.is(actual, expected);
        }
      }
    }
  }));
});

test.group('buildObject', (test) => {
  const model = {
    name: 'test',
    data: {
      count: 1,
    },
    properties: {
      phone: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            data: {
              build() {
                return to.random([ 'Home', 'Work', 'Mobile', 'Main', 'Other' ]);
              }
            }
          },
          phone_number: {
            type: 'string',
            data: {
              build() {
                return '(333) 333 - 3333';
              }
            }
          }
        }
      }
    }
  };

  test((t) => {
    const paths = getPaths(model);
    const doc = t.context.document.initializeDocument(model, paths);
    const actual = t.context.document.buildObject(model, to.clone(doc), paths, 1);

    const schema = is.object({
      phone: is.object({
        type: is.string(),
        phone_number: is.string().regex(/\(333\) 333 \- 3333/),
      })
    });

    const { error } = schema.validate(actual);
    if (error) {
      t.fail(error);
    } else {
      t.pass();
    }

    t.notDeepEqual(doc, actual);
  });

  test('throws error', (t) => {
    const paths = getPaths(model);
    const doc = t.context.document.initializeDocument(model, paths);
    // highjack the log function
    t.context.document.log = (type, message) => {
      if (type === 'error') {
        throw new Error(message);
      }
    };

    const tester = () => t.context.document.buildObject(model, to.clone(doc), { model: [ 'a' ], document: [ 'b' ] }, 1);
    t.throws(tester);
  });
});


test.group('buildValue', (test) => {
  test('passed value', (t) => {
    t.is(t.context.document.buildValue({}, 'value'), 'value');
    t.is(t.context.document.buildValue({}, 1), 1);
    t.deepEqual(t.context.document.buildValue({}, [ 'woohoo' ]), [ 'woohoo' ]);
    t.deepEqual(t.context.document.buildValue({}, { foo: 'foo' }), { foo: 'foo' });
  });

  test.group('property.data.pre_build', (test) => {
    test('without passed value', (t) => {
      const actual = t.context.document.buildValue({
        data: { pre_build: () => 'pre_build' }
      });

      t.is(actual, 'pre_build');
    });

    test('with passed value', (t) => {
      const actual = t.context.document.buildValue({
        data: { pre_build: () => 'pre_build' }
      }, 'passed value');
      t.not(actual, 'passed value');
      t.is(actual, 'pre_build');
    });
  });

  test.group('property.data.value', (test) => {
    test((t) => {
      const actual = t.context.document.buildValue({ data: { value: 'value' } });

      t.is(actual, 'value');
    });

    test('with property.data.pre_build', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          pre_build: () => 'pre_build',
          value: 'value',
        }
      });

      t.not(actual, 'pre_build');
      t.is(actual, 'value');
    });

    test('with property.data.build', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          build: () => 'build',
          value: 'value',
        }
      });

      t.not(actual, 'build');
      t.is(actual, 'value');
    });

    test('with property.data.fake', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          fake: '{{name.firstName}}',
          value: 'value',
        }
      });

      t.falsy(/[A-Z]/.test(actual));
      t.is(actual, 'value');
    });

    test('with passed value', (t) => {
      const actual = t.context.document.buildValue({
        data: { value: 'value' }
      }, 'passed value');

      t.not(actual, 'passed value');
      t.is(actual, 'value');
    });
  });

  test.group('property.data.build', (test) => {
    test((t) => {
      const actual = t.context.document.buildValue({
        data: { build: () => 'build' }
      });
      t.is(actual, 'build');
    });

    test('with property.data.pre_build', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          pre_build: () => 'pre_build',
          build: () => 'build',
        }
      });
      t.not(actual, 'pre_build');
      t.is(actual, 'build');
    });

    test('with global value set in pre_build', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          pre_build: (context, documents, globals) => {
            globals.pre_build_global = 'pre_build_global';
          },
          build: (context, documents, globals) => globals.pre_build_global,
        }
      });

      t.is(actual, 'pre_build_global');
    });

    test('with property.data.fake', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          fake: '{{name.firstName}}',
          build: () => 'build',
        }
      });

      t.falsy(/[A-Z]/.test(actual));
      t.is(actual, 'build');
    });

    test('with passed value', (t) => {
      const actual = t.context.document.buildValue({
        data: { build: () => 'build' }
      });
      t.not(actual, 'passed value');
      t.is(actual, 'build');
    });
  });

  test.group('property.data.fake', (test) => {
    const fake = '{{name.firstName}}';
    test((t) => {
      const actual = t.context.document.buildValue({ data: { fake } });

      t.not(actual, fake);
      t.truthy(/[A-Z]/.test(actual));
    });

    test('with property.data.pre_build', (t) => {
      const actual = t.context.document.buildValue({
        data: {
          pre_build: () => 'pre_build',
          fake,
        }
      });

      t.not(actual, 'pre_build');
      t.not(actual, fake);
      t.truthy(/[A-Z]/.test(actual));
    });

    test('with passed value', (t) => {
      const actual = t.context.document.buildValue({
        data: { fake }
      }, 'passed value');

      t.not(actual, 'passed value');
      t.not(actual, fake);
      t.truthy(/[A-Z]/.test(actual));
    });
  });

  test.group('property.items', (test) => {
    function items(obj) {
      return {
        type: 'array',
        items: obj,
      };
    }

    test('with passed value', (t) => {
      t.plan(7);
      const actual = t.context.document.buildValue(items({
        type: 'string',
        data: {
          count: 5,
        }
      }), []);

      t.is(to.type(actual), 'array');
      t.is(actual.length, 5);
      // expect all items to be empty strings
      actual.forEach((item) => t.is(item, ''));
    });

    test('with property.items.data.pre_build', (t) => {
      t.plan(7);
      const actual = t.context.document.buildValue(items({
        type: 'string',
        data: {
          count: 5,
          pre_build: () => 'pre_build',
        }
      }), []);

      t.is(to.type(actual), 'array');
      t.is(actual.length, 5);
      actual.forEach((item) => t.is(item, 'pre_build'));
    });

    test('with property.items.data.value', (t) => {
      t.plan(7);
      const actual = t.context.document.buildValue(items({
        type: 'string',
        data: {
          count: 5,
          value: 'value',
        }
      }), []);

      t.is(to.type(actual), 'array');
      t.is(actual.length, 5);
      actual.forEach((item) => t.is(item, 'value'));
    });

    test('with property.items.data.build', (t) => {
      t.plan(7);
      const actual = t.context.document.buildValue(items({
        type: 'string',
        data: {
          count: 5,
          build: () => 'build',
        }
      }), []);

      t.is(to.type(actual), 'array');
      t.is(actual.length, 5);
      actual.forEach((item) => t.is(item, 'build'));
    });

    test('with property.items.data.fake', (t) => {
      t.plan(7);
      const actual = t.context.document.buildValue(items({
        type: 'string',
        data: {
          count: 5,
          fake: '{{name.firstName}}',
        }
      }), []);

      t.is(to.type(actual), 'array');
      t.is(actual.length, 5);
      actual.forEach((item) => t.truthy(/[A-Z]/.test(item)));
    });

    test('complex array', (t) => {
      const actual = t.context.document.buildValue(items({
        type: 'object',
        data: { count: 5 },
        properties: {
          first_name: {
            type: 'string',
            description: 'The childs first_name',
            data: { fake: '{{name.firstName}}' },
          },
          gender: {
            type: 'string',
            description: 'The childs gender',
            data: { build: () => to.random(1, 10) >= 3 ? to.random([ 'M', 'F' ]) : null },
          },
          age: {
            type: 'integer',
            description: 'The childs age',
            data: { build: () => to.random(1, 17) },
          },
        }
      }), []);

      is.assert(actual, is.array()
        .items(is.object({
          first_name: is.string().regex(/[A-Z][a-zA-Z\s]+/),
          gender: [ is.string().regex(/M|F/), is.allow(null) ],
          age: is.number().min(1).max(17),
        }))
        .length(5));
    });
  });
});

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
