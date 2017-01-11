import { join as p } from 'path';
import ava from 'ava-spec';
import to from 'to-js';
import fs from 'fs-extra-promisify';
import nixt from 'nixt';
import { stripColor } from 'chalk';
const bin = nixt().cwd(p(__dirname, 'fixtures', 'models')).base('../../../bin/fakeit ');
import cli, { code, dim } from '../dist/cli.js';

const test = ava.group('cli:');

test('cli is the default function', (t) => {
  t.is(typeof cli, 'function');
});

test.group('console', (test) => {
  const expected_keys = [
    'id',
    'type',
    'user_id',
    'first_name',
    'last_name',
    'email_address',
    'phone',
    'active',
    'created_on'
  ];
  /* eslint-disable quotes */
  test.cb("--count 1 'simple/models/*'", (t) => {
    bin.clone()
      .run("console --count 1 'simple/models/*'")
      .expect(({ stdout }) => {
        stdout = stdout.split('\n');
        const first_line = stdout.shift();
        t.truthy(/^\[[0-9:]+\].+info: Generating 1 document\(s\) for Users model$/.test(first_line));
        const data = to.object(stdout.join('\n'));

        t.is(to.type(data), 'array');
        t.is(data.length, 1);
        t.deepEqual(to.keys(data[0]), expected_keys);
      })
      .end(t.end);
  });

  test.cb("--count 1 'simple/models/*' --format 'csv'", (t) => {
    bin.clone()
      .run("console --count 1 'simple/models/*' --format 'csv'")
      .expect(({ stdout }) => {
        stdout = stdout.split('\n');
        const first_line = stdout.shift();
        t.truthy(/^\[[0-9:]+\].+info: Generating 1 document\(s\) for Users model$/.test(first_line));
        t.truthy(/^[┌─┬┐]+$/.test(stdout[0]));
        t.truthy(/^[├─┼┤]+$/.test(stdout[2]));
        t.truthy(/^[└─┴┘]+$/.test(stdout[4]));
        t.deepEqual(stdout[1].slice(1, -1).trim().split(/\s*│\s*/g), expected_keys);
        t.is(stdout[3].slice(1, -1).trim().split(/\s*│\s*/g).length, 9);
      })
      .end(t.end);
  });

  test.cb("'simple/models/*' --format 'csv' --count 1 --no-highlight", (t) => {
    bin.clone()
      .run("console 'simple/models/*' --format 'csv' --count 1 --no-highlight")
      .expect(({ stdout }) => {
        stdout = stdout.split('\n');
        const first_line = stdout.shift();
        t.truthy(/^\[[0-9:]+\].+info: Generating 1 document\(s\) for Users model$/.test(first_line));
        t.is(stdout[0], '"id","type","user_id","first_name","last_name","email_address","phone","active","created_on"');
        t.deepEqual(stdout[0].replace(/"/g, '').split(','), expected_keys);
      })
      .end(t.end);
  });

  /* eslint-enable quotes */
});


test.group('directory|folder', (test) => {
  /* eslint-disable quotes */
  const root = p(__dirname, 'directory-cli-test');
  const base = nixt().cwd(root).base('../../bin/fakeit ');
  const expected_keys = [
    'id',
    'type',
    'user_id',
    'first_name',
    'last_name',
    'email_address',
    'phone',
    'active',
    'created_on'
  ];

  test.before(async () => {
    await fs.remove(root);
    await fs.ensureDir(root);
  });

  test.cb('output files to directory', (t) => {
    const file = p(root, 'directory-test', 'user_0.json');
    base.clone()
      .run(`directory 'directory-test' '../fixtures/models/simple/models/users.yaml' --count 1`)
      .exist(file)
      .match(file, new RegExp(`"${expected_keys.join('|')}":`, 'g'))
      .end(t.end);
  });

  test.cb('zip output by passing in as the file.zip', (t) => {
    base.clone()
      .run(`folder 'zip-test.zip' '../fixtures/models/simple/models/users.yaml' --count 1`)
      .exist(p(root, 'zip-test.zip'))
      .end(t.end);
  });

  test.cb('zip output by passing in --archive as an option', (t) => {
    base.clone()
      .run(`folder 'zip-test' '../fixtures/models/simple/models/users.yaml' --count 1 --archive 'archive.zip'`)
      .exist(p(root, 'zip-test', 'archive.zip'))
      .end(t.end);
  });

  test.after.always(() => fs.remove(root));
  /* eslint-enable quotes */
});

test.cb('throws error when something goes wrong', (t) => {
  /* eslint-disable quotes */
  bin.clone()
    .run(`folder 'error-test' 'simple/models/*' --count 1 --archive 'woohoo'`)
    .stderr(/The archive file must have a file extention of \`\.zip\`/)
    .end(t.end);
  /* eslint-enable quotes */
});

test.group('help', (test) => {
  test.cb('help as argument', (t) => {
    bin.clone()
      .run('help')
      .stdout(/^\s*Usage: fakeit \[command\] \[\<file\|directory\|glob\> \.\.\.\]/)
      .end(t.end);
  });

  test.cb('no arguments were passed', (t) => {
    bin.clone()
      .run('')
      .stdout(/^\s*Usage: fakeit \[command\] \[\<file\|directory\|glob\> \.\.\.\]/)
      .end(t.end);
  });

  test.cb('console action with no model arguments', (t) => {
    bin.clone()
      .run('console')
      .stdout(/^.*warning.*:\s+you must pass in models to use/)
      .end(t.end);
  });
});

test('code', (t) => {
  t.is(code('one'), '\u001b[1mone\u001b[22m');
  t.deepEqual(stripColor(code('one', 'two', 'three')).split(/\s*,\s*/), [ 'one', 'two', 'three' ]);
});

test('dim', (t) => {
  t.is(dim('one'), '\u001b[2mone\u001b[22m');
  t.deepEqual(stripColor(dim('one', 'two', 'three')).split(/\s*,\s*/), [ 'one', 'two', 'three' ]);
});
