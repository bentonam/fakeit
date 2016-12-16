/* eslint-disable no-undefined */

import Models, {
  parseModelInputs,
  parseModelFunctions,
} from '../dist/models.js';
import path, { join as p } from 'path';
import ava from 'ava-spec';
import to from 'to-js';
import is from 'joi';
import _ from 'lodash';
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
  return _.without(models.files, ...done);
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

test.group('parseModelFunctions', (test) => {
  function getFunctionPaths(model) {
    return to.keys(to.flatten(model))
      .filter((key) => /((pre|post)_run)|(pre_|post_)?build$/.test(key));
  }

  test.group('ensure all `pre` and `post` instances are functions', models((t, file) => {
    const model = contents[file];
    const paths = getFunctionPaths(model);
    const obj = _.pick(model, paths);
    parseModelFunctions(obj);

    for (let str of paths) {
      let fn = _.get(obj, str);
      t.is(typeof fn, 'function');
      t.is(fn.name, to.camelCase(str));
    }
    return obj;
  }));

  test.group('ensure es6 support', (test) => {
    /* eslint-disable max-len, quotes */
    const tests = [
      {
        name: 'single line has a return',
        actual: '`contact_${this.contact_id}`',
        expected: "function build(_documents, _globals, _inputs, _faker, _chance, _document_index) {\n  function __result(documents, globals, inputs, faker, chance, document_index) {\n    return \"contact_\" + this.contact_id;\n  }\n  return __result.apply(this, [].slice.call(arguments));\n}",
      },
      {
        name: 'multi line doesn\'t have automatic return',
        actual: 'console.log("woohoo");\n`contact_${this.contact_id}`',
        expected: "function build(_documents, _globals, _inputs, _faker, _chance, _document_index) {\n  function __result(documents, globals, inputs, faker, chance, document_index) {\n    console.log(\"woohoo\");\n    \"contact_\" + this.contact_id;\n  }\n  return __result.apply(this, [].slice.call(arguments));\n}",
      },
      {
        name: 'object deconstruction',
        actual: 'const { countries } = inputs\nreturn `${this.contact_id}${countries[0]}`',
        expected: "function build(_documents, _globals, _inputs, _faker, _chance, _document_index) {\n  function __result(documents, globals, inputs, faker, chance, document_index) {\n    var countries = inputs.countries;\n  \n    return \"\" + this.contact_id + countries[0];\n  }\n  return __result.apply(this, [].slice.call(arguments));\n}",
      },
    ];
    /* eslint-enable max-len, quotes */

    tests.forEach(({ name, actual: build, expected }) => {
      test(name, (t) => {
        let actual = { name, build };
        parseModelFunctions(actual, babel_config);
        actual = actual.build;
        t.is(typeof actual, 'function');
        t.is(actual.toString(), expected);
      });
    });
  });

  test('babel failed to compile', async (t) => {
    let actual = {
      file: __dirname,
      build: 'cons { countries } = woohoo\nreturn `${this.contact_id}${countries[0]}`',
    };
    const tester = () => parseModelFunctions(actual, babel_config);
    const error = t.throws(tester);
    t.is(error.message, `Failed to transpile build with babel in ${__dirname}\nunknown: Unexpected token, expected ; (2:7)`);
  });

  test('failed to create function', async (t) => {
    let actual = {
      file: __dirname,
      build: 'var shoot = "woohoo"',
    };
    const tester = () => parseModelFunctions(actual);
    const error = t.throws(tester);
    t.is(error.message, 'Function Error in model \'undefined\', for property: build, Reason: Unexpected token var');
  });

  test.group('functions are returning values correctly', (test) => {
    const tests = [
      'documents',
      'globals',
      'inputs',
      'faker',
      'chance',
      'document_index',
      'this',
    ];

    tests.forEach((name, i) => {
      const stub = tests.map((item) => null); // eslint-disable-line
      test(name, (t) => {
        stub[i] = name;
        const expected = `function build(_documents, _globals, _inputs, _faker, _chance, _document_index) {\n  function __result(documents, globals, inputs, faker, chance, document_index) {\n    return ${name} + \"[${i}]\";\n  }\n  return __result.apply(this, [].slice.call(arguments));\n}`; // eslint-disable-line max-len
        let actual = {
          name,
          build: `\`\$\{${name}\}[${i}]\``
        };
        parseModelFunctions(actual, babel_config);
        actual = actual.build;
        t.is(typeof actual, 'function');
        t.is(actual.toString(), expected);
        t.is(actual.apply(name, stub), `${name}[${i}]`);
      });
    });
  });
});


// log all the schema keys that still need to be done
test.after(models.todo);
