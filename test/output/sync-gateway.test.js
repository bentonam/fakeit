/* eslint-disable id-length, no-shadow */

import SyncGateway from '../../dist/output/sync-gateway';
import default_options from '../../dist/output/default-options';
import ava from 'ava-spec';

const test = ava.group('output:sync-gateway');

test.beforeEach((t) => {
  t.context = new SyncGateway();
});

test('without args', (t) => {
  t.deepEqual(t.context.output_options, default_options);
  t.is(t.context.prepared, false);
  t.is(typeof t.context.prepare, 'function');
  t.is(typeof t.context.output, 'function');
});

test.todo('prepare');
test.todo('setup');
test.todo('output');
