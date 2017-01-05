/* eslint-disable id-length, no-shadow */

import path, { join as p } from 'path';
import ava from 'ava-spec';
import fs from 'fs-extra-promisify';
import {
  objectSearch,
  findFiles,
  readFiles,
  pool,
  parsers,
  Logger,
} from '../dist/utils';
import { map } from 'async-array-methods';
import to from 'to-js';
import AdmZip from 'adm-zip';
import { stdout } from 'test-console';
import { stripColor } from 'chalk';

async function touch(...files) {
  return map(to.flatten(files), (file) => {
    if (file.path) {
      return fs.outputFile(file.path, file.content);
    }
    return fs.ensureFile(file);
  });
}

const test = ava.group('utils:');
const utils_root = p(__dirname, 'fixtures', 'utils');

test.group('objectSearch', (test) => {
  const obj = {
    one: {
      two: {
        three: 'woohoo'
      }
    }
  };

  test('no pattern', (t) => {
    const actual = objectSearch(obj);
    t.is(actual.length, 3);
    t.deepEqual(actual, [ 'one', 'one.two', 'one.two.three' ]);
  });

  test('match first instance of `one`', (t) => {
    const actual = objectSearch(obj, /^one$/);
    t.is(actual.length, 1);
    t.deepEqual(actual, [ 'one' ]);
  });

  test('match first instance of `two`', (t) => {
    const actual = objectSearch(obj, /^.*two$/);
    t.is(actual.length, 1);
    t.deepEqual(actual, [ 'one.two' ]);
  });
});


test.group('findFiles', (test) => {
  const root = p(utils_root, 'find-files');
  const files = [
    p(root, 'file-1.js'),
    p(root, 'one', 'file.js'),
    p(root, 'one', 'two', 'file.js'),
    p(root, 'one', 'two', 'three', 'file.js'),
    p(root, 'one', 'two', 'three', 'four', 'file.js'),
  ];

  test.before(async () => {
    await fs.remove(root);
    await touch(files);
  });

  test('pass a dir', async (t) => {
    const actual = await findFiles(root);
    t.is(actual.length, 5);
    t.deepEqual(actual, files);
  });

  test('pass a glob', async (t) => {
    const actual = await findFiles(p(root, '*.js'));
    t.is(actual.length, 1);
    t.deepEqual(actual, files.slice(0, 1));
  });

  test.after.always(() => fs.remove(root));
});


test.group('readFiles', (test) => {
  const root = p(utils_root, 'read-files');
  /* eslint-disable max-len */
  const plain_files = [
    { path: p('file-1.txt'), content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque qui itaque assumenda expedita a unde illum facere laborum, quaerat, ipsam error facilis ipsum quasi et, id deleniti placeat pariatur quia!' },
    { path: p('one', 'file.txt'), content: 'Et fuga in, necessitatibus ipsum tempore! Libero pariatur et nihil impedit quasi, saepe, vero facere aspernatur asperiores laudantium fugiat! Quibusdam modi, soluta assumenda, veritatis cumque dolorum tempore excepturi voluptate! Fugit?' },
    { path: p('one', 'two', 'file.txt'), content: 'Harum asperiores, dignissimos esse, quibusdam veritatis nihil velit ipsa maiores quos natus officia enim laboriosam atque odio quod! Sed quod temporibus amet doloremque modi sequi quisquam quidem, neque debitis magnam!' },
    { path: p('one', 'two', 'three', 'file.txt'), content: 'Blanditiis iure nihil nam. Debitis, commodi beatae. Praesentium at, blanditiis libero ipsum consectetur illo debitis odit, nemo, cupiditate modi quod veritatis aliquam accusamus facilis quos, vero dolorum adipisci quis hic.' },
    { path: p('one', 'two', 'three', 'four', 'file.txt'), content: 'Beatae dolores porro culpa sit! Ipsam suscipit quaerat tenetur iure officiis. Asperiores optio, omnis hic exercitationem doloribus adipisci nesciunt voluptates consequuntur. Nihil veniam et, quas minima autem dolore aspernatur saepe.' },
  ];
  const root_plain_files = to.clone(plain_files).map((file) => {
    file.path = p(root, file.path);
    return file;
  });

  // creating archives
  const zip_file = p(root, 'zip-test.zip');
  let zip = new AdmZip();
  /* eslint-enable max-len */

  test.before(async () => {
    await fs.remove(root);
    await touch(root_plain_files);
    plain_files.forEach((file) => {
      zip.addFile(file.path, file.content);
    });
    zip.writeZip(zip_file);
  });

  test('single file', async (t) => {
    const file = root_plain_files[0];
    const actual = await readFiles(file.path);
    t.is(actual.length, 1);
    t.is(to.type(actual), 'array');
    t.is(to.type(actual[0]), 'object');
  });

  test('plain files', async (t) => {
    const actual = await readFiles(root_plain_files.map((obj) => obj.path));
    t.is(actual.length, 5);
    t.is(to.type(actual), 'array');
    t.is(to.type(actual[0]), 'object');
    t.deepEqual(to.keys(actual[0]), [ ...to.keys(path.parse(root_plain_files[0].path)), 'path', 'content' ]);
    for (let i = 0; i < root_plain_files.length; i++) {
      let plain_file = root_plain_files[i];
      let actual_file = actual[i];
      t.is(actual_file.path, plain_file.path);
      t.is(actual_file.content, plain_file.content);
    }
  });

  test('zip file only', async (t) => {
    const actual = await readFiles(zip_file);
    t.is(actual.length, 5);
    t.is(to.type(actual), 'array');
    t.is(to.type(actual[0]), 'object');
    t.deepEqual(to.keys(actual[0]), [ ...to.keys(path.parse(plain_files[0].path)), 'path', 'content' ]);
    for (let i = 0; i < plain_files.length; i++) {
      let plain_file = plain_files[i];
      let actual_file = actual[i];
      t.is(actual_file.path, plain_file.path);
      t.is(actual_file.content, plain_file.content);
    }
  });

  test.after.always(() => fs.remove(root));
});


test.serial.group('pool', async (test) => {
  const delay = (duration) => {
    duration *= 100;
    return new Promise((resolve) => {
      console.log(`${duration} start`);
      setTimeout(() => {
        console.log(`${duration} end`);
        resolve();
      }, duration);
    });
  };
  const items = [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten' ];
  test('no limit', async (t) => {
    const inspect = stdout.inspect();
    let result = pool(items, async (item, i, array) => {
      t.deepEqual(array, items);
      t.is(typeof i, 'number');
      await delay(i);
      return `woohoo ${item}`;
    });
    t.is(typeof result.then, 'function');
    result = await result;
    inspect.restore();
    t.notDeepEqual(result, items);
    t.deepEqual(result, items.map((item) => `woohoo ${item}`));
    t.deepEqual(inspect.output.join('\n').split('\n').filter(Boolean), [
      '0 start',
      '100 start',
      '200 start',
      '300 start',
      '400 start',
      '500 start',
      '600 start',
      '700 start',
      '800 start',
      '900 start',
      '0 end',
      '100 end',
      '200 end',
      '300 end',
      '400 end',
      '500 end',
      '600 end',
      '700 end',
      '800 end',
      '900 end',
    ]);
  });

  test('limit 3', async (t) => {
    const inspect = stdout.inspect();
    let result = pool(items, async (item, i, array) => {
      t.deepEqual(array, items);
      t.is(typeof i, 'number');
      await delay(i);
      return `woohoo ${item}`;
    }, 3);
    t.is(typeof result.then, 'function');
    result = await result;
    inspect.restore();
    t.notDeepEqual(result, items);
    t.deepEqual(result, items.map((item) => `woohoo ${item}`));
    t.deepEqual(inspect.output.join('\n').split('\n').filter(Boolean), [
      '0 start',
      '100 start',
      '200 start',
      '0 end',
      '300 start',
      '100 end',
      '400 start',
      '200 end',
      '500 start',
      '300 end',
      '600 start',
      '400 end',
      '700 start',
      '500 end',
      '800 start',
      '600 end',
      '900 start',
      '700 end',
      '800 end',
      '900 end'
    ]);
  });
});


test.serial.group('parsers', (test) => {
  const expected = {
    _id: 'airport_56',
    airport_id: 56,
    doc_type: 'airport',
    airport_ident: 'AYGA',
    airport_type: 'medium_airport',
    airport_name: 'Goroka',
    geo: {
      latitude: -6.081689835,
      longitude: 145.3919983
    },
    elevation: 5282,
    iso_continent: 'OC',
    iso_country: 'PG',
    iso_region: 'PG-EHG',
    municipality: 'Goroka',
    airport_icao: 'AYGA',
    airport_iata: 'GKA',
    airport_gps_code: 'AYGA',
    timezone_offset: 10,
    dst: 'U',
    timezone: 'Pacific/Port_Moresby'
  };

  // stores the tests for each of the parsers
  const tests = {};
  /* eslint-disable max-len */
  tests.yaml = tests.yml = `
    _id: airport_56
    airport_id: 56
    doc_type: airport
    airport_ident: AYGA
    airport_type: medium_airport
    airport_name: Goroka
    geo:
      latitude: -6.081689835
      longitude: 145.3919983
    elevation: 5282
    iso_continent: OC
    iso_country: PG
    iso_region: PG-EHG
    municipality: Goroka
    airport_icao: AYGA
    airport_iata: GKA
    airport_gps_code: AYGA
    timezone_offset: 10
    dst: U
    timezone: Pacific/Port_Moresby
  `;

  /* eslint-disable */
  tests.json = {
    "_id": "airport_56",
    "airport_id": 56,
    "doc_type": "airport",
    "airport_ident": "AYGA",
    "airport_type": "medium_airport",
    "airport_name": "Goroka",
    "geo": {
      "latitude": -6.081689835,
      "longitude": 145.3919983
    },
    "elevation": 5282,
    "iso_continent": "OC",
    "iso_country": "PG",
    "iso_region": "PG-EHG",
    "municipality": "Goroka",
    "airport_icao": "AYGA",
    "airport_iata": "GKA",
    "airport_gps_code": "AYGA",
    "timezone_offset": 10,
    "dst": "U",
    "timezone": "Pacific/Port_Moresby"
  };

  /* eslint-enable */

  tests.cson = `
    _id: "airport_56"
    airport_id: 56
    doc_type: "airport"
    airport_ident: "AYGA"
    airport_type: "medium_airport"
    airport_name: "Goroka"
    geo:
      latitude: -6.081689835
      longitude: 145.3919983
    elevation: 5282
    iso_continent: "OC"
    iso_country: "PG"
    iso_region: "PG-EHG"
    municipality: "Goroka"
    airport_icao: "AYGA"
    airport_iata: "GKA"
    airport_gps_code: "AYGA"
    timezone_offset: 10
    dst: "U"
    timezone: "Pacific/Port_Moresby"
  `;

  tests.csv = `
    "_id","airport_id","doc_type","airport_ident","airport_type","airport_name","geo","elevation","iso_continent","iso_country","iso_region","municipality","airport_icao","airport_iata","airport_gps_code","timezone_offset","dst","timezone"
    "airport_56",56,"airport","AYGA","medium_airport","Goroka","{""latitude"":-6.081689835,""longitude"":145.3919983}",5282,"OC","PG","PG-EHG","Goroka","AYGA","GKA","AYGA",10,"U","Pacific/Port_Moresby"
  `;

  /* eslint-enable max-len */
  // stores the available parsers that should exist
  const available = to.keys(tests);

  // generate tests for each parser in the list
  for (var parser in parsers) {
    if (parsers.hasOwnProperty(parser)) {
      parserTest(parser);
    }
  }

  function parserTest(name) {
    test.group(name, (test) => {
      const parser = parsers[name];
      let content = tests[name];
      if (name === 'json') {
        content = JSON.stringify(content, null, 2);
      } else {
        content = to.normalize(tests[name]);
      }
      test('exists', (t) => {
        t.truthy(available.includes(name));
      });

      test('general', (t) => {
        t.plan(5);
        t.is(to.type(parser), 'object');
        t.is(to.type(parser.parse), 'function');
        t.is(to.type(parser.stringify), 'function');
        for (let fn in parser) {
          if (parser.hasOwnProperty(fn)) {
            t.truthy([ 'parse', 'stringify' ].includes(fn));
          }
        }
      });

      test('parse', async (t) => {
        let result = parser.parse(content);
        t.is(to.type(result.then), 'function', 'This function should be async');
        result = await result;

        if (name === 'csv') {
          t.is(to.type(result), 'array');
          result = result[0];
        } else {
          t.is(to.type(result), 'object');
        }

        t.deepEqual(result, expected);
      });

      test('stringify', async (t) => {
        let result = parser.stringify(expected);
        t.is(to.type(result.then), 'function', 'This function should be async');
        result = await result;
        t.deepEqual(result, content);
      });
    });
  }
});


test.group('Logger', (test) => {
  test.group('options', (test) => {
    test('none', (t) => {
      const logger = new Logger();
      t.deepEqual(logger.options, { log: true, verbose: false, timestamp: true });
    });

    test('log is false', (t) => {
      const logger = new Logger({ log: false });
      t.deepEqual(logger.options, { log: false, verbose: false, timestamp: true });
    });
  });

  test.serial.group('time', (test) => {
    const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    test('throws when no label is passed (time)', (t) => {
      const logger = new Logger();
      const tester = () => logger.time();
      const inspect = stdout.inspect();
      t.throws(tester);
      inspect.restore();
      t.not(stripColor(inspect.output[0]), inspect.output[0]);
      t.truthy(/^\[[0-9]+:[0-9]+:[0-9]+\]\s.+\serror:\s*$/.test(stripColor(inspect.output[0])));
      t.is(inspect.output.length, 2);
      t.is(inspect.output[1].split('\n')[0], 'You must pass in a label for `Logger.prototype.time`');
    });

    test('throws when no label is passed (timeEnd)', (t) => {
      const logger = new Logger();
      const tester = () => logger.timeEnd();
      const inspect = stdout.inspect();
      t.throws(tester);
      inspect.restore();
      t.not(stripColor(inspect.output[0]), inspect.output[0]);
      t.truthy(/^\[[0-9]+:[0-9]+:[0-9]+\]\s.+\serror:\s*$/.test(stripColor(inspect.output[0])));
      t.is(inspect.output.length, 2);
      t.is(inspect.output[1].split('\n')[0], 'You must pass in a label for `Logger.prototype.timeEnd`');
    });

    test('returns this', (t) => {
      const logger = new Logger();
      const actual = logger.time('returns');
      t.is(actual.constructor.name, 'Logger');
    });

    test.group((test) => {
      const tests = [
        { time: 1, expected: 1 },
        { time: 100, expected: 100 },
        { time: 500, expected: 500 },
        { time: 1500, expected: 1.5 },
        { time: 2500, expected: 2.5 },
      ];

      tests.forEach(({ time, expected }) => {
        test(expected.toString(), async (t) => {
          let min = expected;
          let max = expected;
          const logger = new Logger();
          logger.time(expected);
          await delay(time);
          let actual = logger.timeEnd(expected);
          t.truthy(actual);
          t.is(typeof actual, 'string');
          let [ number, unit ] = stripColor(actual).match(/\+?([0-9\.]+)([ms]+)/).slice(1);
          number = parseFloat(number);
          if (unit === 'ms') {
            min -= 8;
            max += 8;
          } else {
            min -= 0.2;
            max += 0.2;
          }

          t.is(unit, time < 1000 ? 'ms' : 's');
          t.truthy(number >= min && number <= max);
        });
      });
    });
  });

  test('functions', (t) => {
    t.deepEqual(
      to.keys(Logger.prototype).sort(),
      [ 'constructor', 'log', 'stamp', 'time', 'timeEnd' ].sort()
    );
  });
});

