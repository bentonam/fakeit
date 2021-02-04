/* eslint-disable id-length, no-shadow */

import default_options from '../../dist/output/default-options';
import ava from 'ava-spec';

const test = ava.group('output:default-options');

test((t) => {
  t.deepEqual(default_options, {
    format: 'json',
    spacing: 2,
    output: 'return',
    limit: 10,
    highlight: true,
    archive: '',
    server: '127.0.0.1',
    bucket: 'default',
    username: '',
    password: '',
    timeout: 5000,
  });
});
