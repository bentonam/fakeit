/* eslint-disable no-undefined */

import Document, {
  transformValueToType,
  getPaths,
  typeToValue,
} from '../dist/documents.js';
/* istanbul ignore next : needed to test models */
const Model = require('../dist/models.js').default;
import path, { join as p } from 'path';
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


let babel_config;

test.before(async () => {
  babel_config = await fs.readJson(p(__dirname, '..', '.babelrc'));
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

test.group('build', (test) => {
  test('model with no data', (t) => {
    const model = {
      name: 'build_test',
      type: 'object',
      properties: {
        test: {
          type: 'string',
          data: {
            build(documents, globals) {
              globals.woohoo = 'woohoo';
              return 'woohoo';
            },
          }
        }
      }
    };

    const doc = t.context.document;
    t.deepEqual(doc.globals, {});
    t.deepEqual(doc.documents, {});
    const actual = doc.build(model);
    const schema = is.array()
      .items(is.object({
        test: is.string().regex(/woohoo/),
      }))
      .length(1);
    is.assert(actual, schema);
    is.assert(doc.documents, is.object({ build_test: schema }));
    t.deepEqual(doc.globals, { woohoo: 'woohoo' });
  });

  test.group('key', (test) => {
    const model = {
      name: 'key_test',
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          data: {
            value: '00000',
          }
        },
        test: {
          type: 'string',
          data: {
            value: 'woohoo',
          }
        }
      }
    };

    const tests = [
      {
        expected: 'key_test0',
      },
      {
        actual: { value: 'value' },
        expected: 'value',
      },
      {
        actual: { build: () => 'build' },
        expected: 'build',
      },
      {
        actual: { fake: '{{finance.account}}' },
        expected: /^[0-9]{8}$/,
      },
      {
        actual: '_id',
        expected: '00000',
      },
    ];

    tests.forEach(({ actual, expected }) => {
      let title = actual;
      if (to.type(title) === 'object') {
        title = to.keys(title)[0];
      }
      test(`is ${title}`, (t) => {
        const doc = t.context.document;
        const obj = to.clone(model);
        if (actual != null) {
          obj.key = actual;
        }
        const result = doc.build(obj);
        if (to.type(expected) === 'regexp') {
          t.truthy(expected.test(result[0].__key)); // eslint-disable-line
        } else {
          t.is(result[0].__key, expected); // eslint-disable-line
        }
      });
    });
  });

  test.group(models(async (t, file) => {
    const { document, model } = t.context;
    await model.registerModels(file);

    // overwrite the inputs to only include 1 item in it's array because several models
    // in flight-data overwrite the data.count to be what ever the model length is and that is
    // brutal on testing performance.
    if ([ 'flight-data', 'music' ].includes(file.split(path.sep)[0])) {
      model.inputs = to.map(model.inputs, ({ key, value }) => {
        return { [key]: [ 0, 0, 0, 0, 0, 0 ].map(() => to.random(value)) };
      });
    }

    // set the document inputs to be what the model inputs are
    document.inputs = model.inputs;

    let actual = [];

    for (let obj of model.models) {
      t.truthy(obj.data.count >= obj.data.min);
      if (obj.data.max !== 0) {
        t.truthy(obj.data.count <= obj.data.max);
      }

      // overwrite the count to be 1 so thousands of documents don't have to be created for the test
      // this will happen in the `index.test.js` file
      obj.data.count = !obj.is_dependency ? 1 : to.random(3, 6);

      let fn = (obj.data.pre_run || {}).toString();
      // if data.count is being set in the pre_run function then replace it with the overwritten count
      if (/this\.data\.count/.test(fn)) {
        fn = fn.replace(/this\.data\.count = [^\n]+/, `this.data.count = ${obj.data.count};`);
        // eslint-disable-next-line
        obj.data.pre_run = new Function(`return ${fn}`)();
      }

      const result = document.build(obj);
      if (!obj.is_dependency) {
        actual.push(result);
      }
    }

    t.is(actual.length, 1);
    actual = actual[0];
    t.is(actual.length, 1);
    actual = actual[0];
    return actual;
  }));
});

test.group('runData', (test) => {
  test('function wasn\'t passed', (t) => {
    const tester = () => t.context.document.runData();
    t.notThrows(tester);
    t.is(tester(), undefined); // eslint-disable-line
  });

  test('returns the context that\'s passed', (t) => {
    function Foo() {
      return this;
    }
    t.is(t.context.document.runData(Foo, 'context'), 'context');
  });

  test('throws error because of something in function', (t) => {
    function Foo() {
      const bar = {};
      return bar.data.woohoo;
    }
    // highjack the log function
    t.context.document.log = (type, message, err) => {
      if (type === 'error') {
        throw new Error(message + err.message);
      }
    };
    const tester = () => t.context.document.runData(Foo, 'context');
    t.throws(tester, /Foo failed\nCannot read property 'woohoo' of undefined/);
  });
});

// not needed because it just calls other functions that have been tested
// test.todo('buildDocument');

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
        items: to.extend({
          data: {
            min: 0,
            max: 0,
            count: 0,
          }
        }, obj),
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

    test('called multiple times returns different array lengths between min and max', (t) => {
      let actual = [];
      for (let i = 0; i < 10; i++) {
        const value = t.context.document.buildValue(items({
          type: 'string',
          data: {
            min: 1,
            max: 10,
            fake: '{{name.firstName}}',
          }
        }), []);
        actual.push(value);
      }

      actual.forEach((item) => t.truthy(/[A-Z]/.test(item)));
      actual = actual.map((item) => item.length);
      t.truthy(_.uniq(actual).length > 1);
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


test.group('postProcess', (test) => {
  const model = {
    name: 'test',
    type: 'object',
    data: {
      count: 1,
    },
    properties: {
      nochanges: {
        type: 'string',
        data: {
          value: 'woohoo',
          post_build() {
            // since this is returning undefined it will not change `nochange`
            return;
          },
        },
      },
      changes: {
        type: 'string',
        data: {
          value: 'woohoo',
          post_build() {
            return to.upperCase(this.changes);
          },
        },
      },
      emails: {
        type: 'array',
        items: {
          type: 'string',
          data: {
            count: to.random(1, 4),
            build() {
              return `${to.random([ 'one', 'two', 'three', 'four' ])}@example.com`;
            },
            post_build() {
              let str = this.split('@');
              str[0] = to.upperCase(str[0]);
              return str.join('@');
            }
          }
        }
      },
      phones: {
        type: 'array',
        items: {
          type: 'object',
          data: {
            count: to.random(1, 4),
            post_build() {
              return;
            }
          },
          properties: {
            type: {
              type: 'string',
              data: {
                build() {
                  return to.random([ 'home', 'work', 'mobile', 'main', 'other' ]);
                },
                post_build() {
                  return to.titleCase(this.type);
                }
              }
            },
            extension: {
              type: 'string',
              data: {
                build() {
                  return '10';
                },
                post_build() {
                  // since this is returning undefined it will not change the extention
                  return;
                }
              }
            },
            phone_number: {
              type: 'string',
              data: {
                build() {
                  return '3333333333';
                },
                post_build() {
                  return this.phone_number.replace(/([0-9]{3})([0-9]{3})([0-9]{4})/, '($1) $2 - $3');
                }
              }
            }
          }
        }
      }
    }
  };

  test((t) => {
    const paths = getPaths(model);
    let doc = t.context.document.initializeDocument(model, paths);
    doc = t.context.document.buildObject(model, doc, paths, 1);
    const actual = t.context.document.postProcess(model, to.clone(doc), paths);
    const schema = is.object({
      nochanges: is.string().lowercase(),
      changes: is.string().uppercase(),
      emails: is.array()
        .items(is.string().regex(/[A-Z]+\@example\.com/))
        .min(1)
        .max(4),
      phones: is.array()
        .items(is.object({
          type: is.string(),
          extension: is.string().regex(/10/),
          phone_number: is.string().regex(/\(333\) 333 \- 3333/),
        }))
        .min(1)
        .max(4),
    });

    t.truthy(/[a-z]+/.test(doc.changes));
    t.truthy(/[A-Z]+/.test(actual.changes));
    is.assert(actual, schema);
    t.notDeepEqual(doc, actual);
  });

  test('throws error', (t) => {
    const paths = getPaths(model);
    let doc = t.context.document.initializeDocument(model, paths);
    doc = t.context.document.buildObject(model, doc, paths, 1);
    // highjack the log function
    t.context.document.log = (type, message) => {
      if (type === 'error') {
        throw new Error(message);
      }
    };

    const tester = () => t.context.document.postProcess(model, to.clone(doc), { model: [ 'a' ], document: [ 'b' ] }, 1);
    t.throws(tester);
  });
});


test.group('transformValueToType', (test) => {
  const tests = [
    {
      actual: [ null, 'woohoo' ],
      expected: 'woohoo',
    },
    {
      actual: [ 'number', null ],
      expected: null,
    },
    {
      actual: [ 'number', undefined ], // eslint-disable-line
      expected: undefined,
    },
    {
      actual: [ 'array', [ 'one', 'two', 'three' ] ],
      expected: [ 'one', 'two', 'three' ],
    },
    {
      actual: [ 'number', '100' ],
      expected: 100,
    },
    {
      actual: [ 'integer', '100' ],
      expected: 100,
    },
    {
      actual: [ 'long', '100' ],
      expected: 100,
    },
    {
      actual: [ 'double', '0.0100000' ],
      expected: 0.01,
    },
    {
      actual: [ 'float', '000000.01' ],
      expected: 0.01,
    },
    {
      actual: [ 'float', '000000.01' ],
      expected: 0.01,
    },
    {
      actual: [ 'string', 'woohoo' ],
      expected: 'woohoo',
    },
    {
      actual: [ 'string', {} ],
      expected: '[object Object]',
    },
    {
      actual: [ 'boolean', false ],
      expected: false,
    },
    {
      actual: [ 'boolean', true ],
      expected: true,
    },
    {
      actual: [ 'boolean', 'false' ],
      expected: false,
    },
    {
      actual: [ 'bool', '0' ],
      expected: false,
    },
    {
      actual: [ 'bool', 'undefined' ],
      expected: false,
    },
    {
      actual: [ 'bool', 'null' ],
      expected: false,
    },
    {
      actual: [ 'object', {} ],
      expected: {},
    },
  ];

  tests.forEach(({ actual, expected }) => {
    let value = actual[1];
    if (to.type(value) === 'object') {
      value = '{}';
    } else if (to.type(value) === 'array') {
      value = `[ '${value.join('\', \'')}' ]`;
    }
    test(`type is \`${actual[0]}\` and value is \`${value}\``, (t) => {
      if ('array,object'.includes(to.type(expected))) {
        t.deepEqual(transformValueToType(...actual), expected);
      } else {
        t.is(transformValueToType(...actual), expected);
      }
    });
  });
});

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


test.after(models.todo);
