/* eslint-disable id-length, no-shadow, no-undefined */

import SyncGateway from '../../dist/output/sync-gateway';
import default_options from '../../dist/output/default-options';
import ava from 'ava-spec';
import nock from 'nock';
nock.disableNetConnect();

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

test.group('prepare', (test) => {
  test('no username and password', async (t) => {
    t.context.output_options.bucket = 'prepare';
    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
    const preparing = t.context.prepare();
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.prepared, false);
    await preparing;
    t.is(t.context.prepared, true);
  });

  // NO IDEA HOW THE HELL TO WRITE UNIT TESTS FOR THIS CRAP
  test.skip('authentication', async (t) => {
    t.context.output_options.bucket = 'prepare';
    t.context.output_options.username = 'Administrator';
    t.context.output_options.password = 'password';

    nock(t.context.output_options.server)
      .post(`/${encodeURIComponent(t.context.output_options.bucket)}/_session`, {
        name: t.context.output_options.username,
        password: t.context.output_options.password,
      })
      .reply({
        ok: true,
      });

    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
    const preparing = t.context.prepare();
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.prepared, false);
    await preparing;
    t.is(t.context.prepared, true);
  });
});

test.group('setup', (test) => {
  test('no username and password', async (t) => {
    t.context.output_options.bucket = 'setup';
    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
    const preparing = t.context.setup();
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.prepared, false);
    await preparing;
    t.is(t.context.prepared, true);
  });

  // NO IDEA HOW THE HELL TO WRITE UNIT TESTS FOR THIS CRAP
  test.skip('authentication', async (t) => {
    t.context.output_options.bucket = 'setup';
    t.context.output_options.username = 'Administrator';
    t.context.output_options.password = 'password';
    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
    const preparing = t.context.setup();
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.prepared, false);
    await preparing;
    t.is(t.context.prepared, true);
  });
});

test.group('output', (test) => {
  test.todo();
});

// this is just calling another library and it's just converting
// it's callback style to a promise style so we just need to ensure
// it's a promise.
test.todo('request');
