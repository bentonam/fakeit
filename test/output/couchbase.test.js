/* eslint-disable id-length, no-shadow, no-undefined */

import Couchbase from '../../dist/output/couchbase';
import couchbase from 'couchbase-promises';
import default_options from '../../dist/output/default-options';
import to from 'to-js';
import ava from 'ava-spec';

const test = ava.group('output:couchbase');

test.beforeEach((t) => {
  t.context = new Couchbase();
  // this replaces the original cluster with the mock cluster that doesn't require
  // an actual server to be running, this way it's easy to test the functionality
  // of our functions and not couchbases functions.
  t.context.cluster = new couchbase.Mock.Cluster(t.context.output_options.server);
});


test('without args', (t) => {
  t.deepEqual(t.context.output_options, default_options);
  t.is(t.context.prepared, false);
  t.is(typeof t.context.prepare, 'function');
  t.is(typeof t.context.output, 'function');
  t.is(t.context.cluster.constructor.name, 'MockCluster');
});

test('prepare', async (t) => {
  t.is(t.context.prepared, false);
  t.is(t.context.preparing, undefined);
  const preparing = t.context.prepare();
  t.is(typeof t.context.preparing.then, 'function');
  t.is(t.context.prepared, false);
  await preparing;
  t.is(t.context.prepared, true);
  t.is(to.type(t.context.bucket), 'object');
  t.is(t.context.bucket.connected, true);
});

test.group('setup', (test) => {
  test(async (t) => {
    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
    const preparing = t.context.setup();
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.prepared, false);
    t.falsy(await preparing);
    t.is(t.context.prepared, true);
    t.is(to.type(t.context.bucket), 'object');
    t.is(t.context.bucket.connected, true);
  });
});

test.group('output', (test) => {
  const languages = {
    cson: to.normalize(`
      [
        {
          id: 302672
          code: "AD"
          name: "Andorra"
          continent: "EU"
        }
        {
          id: 302618
          code: "AE"
          name: "United Arab Emirates"
          continent: "AS"
        }
      ]
    `),
    csv: to.normalize(`
      id,code,name,continent
      302672,AD,Andorra,EU
      302618,AE,United Arab Emirates,AS
      302619,AF,Afghanistan,AS
      302722,AG,Antigua and Barbuda,NA
      302723,AI,Anguilla,NA
      302673,AL,Albania,EU
      302620,AM,Armenia,AS
      302556,AO,Angola,AF
      302615,AQ,Antarctica,AN
      302789,AR,Argentina,SA
      302763,AS,American Samoa,OC
      302674,AT,Austria,EU
      302764,AU,Australia,OC
      302725,AW,Aruba,NA
      302621,AZ,Azerbaijan,AS
      302675,BA,Bosnia and Herzegovina,EU
    `),
    json: to.json([
      {
        id: 302672,
        code: 'AD',
        name: 'Andorra',
        continent: 'EU'
      },
      {
        id: 302618,
        code: 'AE',
        name: 'United Arab Emirates',
        continent: 'AS'
      },
    ]),
    yaml: to.normalize(`
      -
        id: 302672
        code: AD
        name: Andorra
        continent: EU
      -
        id: 302618
        code: AE
        name: 'United Arab Emirates'
        continent: AS
      -
        id: 302619
        code: AF
        name: Afghanistan
        continent: AS
    `)
  };

  for (let language of to.keys(languages)) {
    const data = languages[language];
    test(language, async (t) => {
      t.context.output_options.bucket = `output-${language}`;
      const id = `1234567890-${language}`;
      t.context.output_options.format = language;
      await t.context.output(id, data);
      const document = await t.context.bucket.getAsync(id);
      t.not(document, null);
      t.deepEqual(document.value, data);
    });
  }

  test('prepare has started but isn\'t complete', async (t) => {
    const language = 'json';
    const data = languages[language];
    t.context.output_options.bucket = `output-${language}`;
    const id = `1234567890-${language}`;
    t.context.output_options.format = language;
    t.context.prepare();
    await t.context.output(id, data);
    const document = await t.context.bucket.getAsync(id);
    t.not(document, null);
    t.deepEqual(document.value, data);
  });
});

test.group('finalize', (test) => {
  test('do nothing because prepare wasn\'t called before finalize', async (t) => {
    await t.context.finalize();
    t.is(t.context.bucket, undefined);
    t.is(t.context.prepared, false);
    t.is(t.context.preparing, undefined);
  });

  test('disconnected', async (t) => {
    t.context.output_options.bucket = 'finalize';
    await t.context.prepare();
    t.is(to.type(t.context.bucket), 'object');
    t.is(t.context.prepared, true);
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.bucket.connected, true);
    await t.context.finalize();
    t.is(to.type(t.context.bucket), 'object');
    t.is(t.context.prepared, true);
    t.is(typeof t.context.preparing.then, 'function');
    t.is(t.context.bucket.connected, false);
  });
});
