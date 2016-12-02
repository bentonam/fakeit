/* eslint-disable id-length, no-shadow */

import Output, { validate, isServer, isString, output_types } from '../../dist/output/index';
import ava from 'ava-spec';
import { join as p } from 'path';
const output_root = p(__dirname, 'fixtures', 'output');

const test = ava.group('output:');

test.beforeEach(async (t) => {
  t.context = new Output();
});

test('without args', async (t) => {
  t.deepEqual(t.context.options, {
    root: process.cwd(),
    log: true,
    verbose: false,
    timestamp: true
  });
  t.truthy(t.context.log_types);
  t.deepEqual(t.context.output_options, {
    format: 'json',
    spacing: 2,
    archive: false,
    output: 'return',
    limit: 100,
    server: '127.0.0.1',
    bucket: 'default',
    password: '',
    username: '',
  });
});

test('output_types', (t) => {
  t.deepEqual(output_types, [ 'return', 'console', 'couchbase', 'sync-gateway' ]);
});

test.group('validation', (test) => {
  test.group('format', (test) => {
    const passing = [ 'json', 'csv', 'yaml', 'yml', 'cson' ];
    passing.forEach((format) => {
      test(`passing ${format}`, (t) => {
        t.context.output_options.format = format;
        try {
          validate.format(format);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });
    const failing = [ 'jpg', 'jpeg', 'js', 'ai', 'psd' ];
    failing.forEach((format) => {
      test(`failing ${format}`, (t) => {
        t.context.output_options.format = format;
        const validateFormat = () => validate.format(format);
        t.throws(validateFormat);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('spacing', (test) => {
    const passing = [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ];
    passing.forEach((spacing) => {
      test(`passing ${spacing}`, (t) => {
        t.context.output_options.spacing = spacing;
        try {
          validate.spacing(spacing);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });
    const failing = [ '', [], {} ];
    failing.forEach((spacing) => {
      test(`failing ${spacing}`, (t) => {
        t.context.output_options.spacing = spacing;
        const validateSpacing = () => validate.spacing(spacing);
        t.throws(validateSpacing);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('output', (test) => {
    const passing = [ 'return', 'console', 'couchbase', 'sync-gateway', 'output/folder' ];
    passing.forEach((output) => {
      test(`passing ${output}`, (t) => {
        if ([ 'couchbase', 'sync-gateway' ].includes(output)) {
          t.context.output_options.username = 'tyler';
          t.context.output_options.password = 'password';
        }
        t.context.output_options.output = output;
        try {
          validate.output(output);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });
    const failing = [ 'outputfile.zip', 2, '', [], {} ];
    failing.forEach((output) => {
      test(`failing ${output}`, (t) => {
        t.context.output_options.output = output;
        const validateOutput = () => validate.output(output);
        t.throws(validateOutput);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('limit', (test) => {
    const passing = [ 100, 200, 300, 400, 500, 600, 700, 800 ];
    passing.forEach((limit) => {
      test(`passing ${limit}`, (t) => {
        t.context.output_options.limit = limit;
        try {
          validate.limit(limit);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });
    const failing = [ '', [], {} ];
    failing.forEach((limit) => {
      test(`failing ${limit}`, (t) => {
        t.context.output_options.limit = limit;
        const validateLimit = () => validate.limit(limit);
        t.throws(validateLimit);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('archive', (test) => {
    const passing = [ true, false ];
    passing.forEach((archive) => {
      test(`passing ${archive}`, (t) => {
        t.context.output_options.output = 'somefolder';
        t.context.output_options.archive = archive;
        try {
          validate.archive(archive, t.context.output_options);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });

    test('passing output is return', (t) => {
      t.context.output_options.archive = false;
      try {
        validate.archive(false, t.context.output_options);
        t.context.validateOutputOptions();
        t.pass();
      } catch (e) {
        t.fail(e);
      }
    });

    test('passing output is console', (t) => {
      t.context.output_options.output = 'console';
      t.context.output_options.archive = false;
      try {
        validate.archive(false, t.context.output_options);
        t.context.validateOutputOptions();
        t.pass();
      } catch (e) {
        t.fail(e);
      }
    });

    const failing = [ 'outputfile.zip', 2, '', [], {} ];
    failing.forEach((archive) => {
      test(`failing ${archive}`, (t) => {
        t.context.output_options.archive = archive;
        const validateArchive = () => validate.archive(archive);
        t.throws(validateArchive);
        t.throws(t.context.validateOutputOptions);
      });
    });

    test('failing output is return', (t) => {
      t.context.output_options.archive = true;
      const validateArchive = () => validate.archive(true, t.context.output_options);
      t.throws(validateArchive);
      t.throws(t.context.validateOutputOptions);
    });
    test('failing output is console', (t) => {
      t.context.output_options.output = 'console';
      t.context.output_options.archive = true;
      const validateArchive = () => validate.archive(true, t.context.output_options);
      t.throws(validateArchive);
      t.throws(t.context.validateOutputOptions);
    });
  });

  test.group('server', (test) => {
    const passing = [ '127.0.0.1', '127.0.0.1:8080', 'http://localhost:3000' ];
    const servers = [ 'sync-gateway', 'couchbase', 'sync-gateway', 'couchbase' ];
    passing.forEach((server, i) => {
      test(`passing ${server}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        t.context.output_options.server = server;
        try {
          validate.server(server, t.context.output_options);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });

    const failing = [ 2, '', [], {} ];
    failing.forEach((server, i) => {
      test(`failing ${server}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        t.context.output_options.server = server;
        const validateServer = () => validate.server(server, t.context.output_options);
        t.throws(validateServer);
        t.throws(t.context.validateOutputOptions);
      });
    });

    test('failing archive is true and output is couchbase', (t) => {
      t.context.output_options.output = 'couchbase';
      t.context.output_options.archive = true;
      t.context.output_options.server = '127.0.0.1';
      const validateServer = () => validate.server(t.context.output_options.server, t.context.output_options);
      t.throws(validateServer);
      t.throws(t.context.validateOutputOptions);
    });

    test('failing archive is true and output is sync-gateway', (t) => {
      t.context.output_options.output = 'sync-gateway';
      t.context.output_options.archive = true;
      t.context.output_options.server = '127.0.0.1';
      const validateServer = () => validate.server(t.context.output_options.server, t.context.output_options);
      t.throws(validateServer);
      t.throws(t.context.validateOutputOptions);
    });
  });

  test.group('bucket', (test) => {
    const passing = [ 'asdfasdfasdf', 'asdfasdfsadf', 'asfasdfasdfasdfasdf' ];
    const servers = [ 'sync-gateway', 'couchbase', 'sync-gateway', 'couchbase' ];
    passing.forEach((bucket, i) => {
      test(`passing ${bucket}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        t.context.output_options.bucket = bucket;
        try {
          validate.bucket(bucket, t.context.output_options);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });

    const failing = [ 2, '', [], {} ];
    failing.forEach((bucket, i) => {
      test(`failing ${bucket}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        t.context.output_options.bucket = bucket;
        const validateBucket = () => validate.bucket(bucket, t.context.output_options);
        t.throws(validateBucket);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('username', (test) => {
    const passing = [ 'asdfasdfasdf', 'asdfasdfsadf', 'asfasdfasdfasdfasdf' ];
    const servers = [ 'sync-gateway', 'couchbase', 'sync-gateway', 'couchbase' ];
    passing.forEach((username, i) => {
      test(`passing ${username}`, (t) => {
        t.context.output_options.username = username;
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        try {
          validate.username(username, t.context.output_options);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });

    const failing = [ 2, '', [], {} ];
    failing.forEach((username, i) => {
      test(`failing ${username}`, (t) => {
        t.context.output_options.username = username;
        t.context.output_options.password = 'password';
        t.context.output_options.output = servers[i];
        const validateUsername = () => validate.username(username, t.context.output_options);
        t.throws(validateUsername);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test.group('password', (test) => {
    const passing = [ 'asdfasdfasdf', 'asdfasdfsadf', 'asfasdfasdfasdfasdf' ];
    const servers = [ 'sync-gateway', 'couchbase', 'sync-gateway', 'couchbase' ];
    passing.forEach((password, i) => {
      test(`passing ${password}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = password;
        t.context.output_options.output = servers[i];
        try {
          validate.password(password, t.context.output_options);
          t.context.validateOutputOptions();
          t.pass();
        } catch (e) {
          t.fail(e);
        }
      });
    });

    const failing = [ 2, '', [], {} ];
    failing.forEach((password, i) => {
      test(`failing ${password}`, (t) => {
        t.context.output_options.username = 'tyler';
        t.context.output_options.password = password;
        t.context.output_options.output = servers[i];
        const validatePassword = () => validate.password(password, t.context.output_options);
        t.throws(validatePassword);
        t.throws(t.context.validateOutputOptions);
      });
    });
  });

  test('isServer', (t) => {
    t.truthy(isServer('sync-gateway'));
    t.truthy(isServer('couchbase'));
    t.falsy(isServer(''));
    t.falsy(isServer('asdfasd'));
    t.falsy(isServer('asdfasdasdasafsdfsd'));
    t.falsy(isServer(2));
  });

  test('isString', (t) => {
    t.truthy(isString('asdfasdf'));
    t.truthy(isString('asdaffsdasdfasd'));
    t.throws(() => isString(''));
    t.throws(() => isString(2));
    t.throws(() => isString([]));
    t.throws(() => isString({}));
  });
});


test.todo('prepare');
test.todo('setup');
test.todo('output');
