import ava from 'ava-spec';
import Logger from '../dist/logger';
import to from 'to-js';
import { stdout } from 'test-console';
import { stripColor } from 'chalk';
const test = ava.group('logger:');
const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

test.beforeEach((t) => {
  t.context = new Logger();
});


test('functions', (t) => {
  t.deepEqual(
    to.keys(Logger.prototype).sort(),
    [ 'constructor', 'log', 'stamp', 'time', 'timeEnd' ].sort()
  );
});


test.group('options', (test) => {
  test('none', (t) => {
    t.deepEqual(t.context.options, { log: true, verbose: false, timestamp: true });
  });

  test('log is false', (t) => {
    const logger = new Logger({ log: false });
    t.deepEqual(logger.options, { log: false, verbose: false, timestamp: true });
  });
});


test.serial.group('log', (test) => {
  test('returns this', (t) => {
    const inspect = stdout.inspect();
    const actual = t.context.log();
    inspect.restore();
    t.is(actual.constructor.name, 'Logger');
  });

  const log_types = [ 'warning', 'success', 'info', 'verbose', 'log' ];

  log_types.forEach((type) => {
    test(type, (t) => {
      t.context.options.verbose = true;
      const inspect = stdout.inspect();
      t.context.log(type, `${type} test`);
      inspect.restore();
      t.is(inspect.output.length, 2);
      t.is(inspect.output[1].trim(), `${type} test`);
      if (![ 'warning', 'info' ].includes(type)) {
        type = '';
      }
      t.truthy(new RegExp(`^\\[[0-9]+:[0-9]+:[0-9]+\\]\\s(?:.+)?\\s*${type}:?\\s*$`).test(stripColor(inspect.output[0])));
    });
  });

  test.group('throws error', (test) => {
    const regex = /^\[[0-9]+:[0-9]+:[0-9]+\]\s.+\serror:\s*$/;
    test('when string is passed as the type', (t) => {
      const tester = () => t.context.log('error', 'woohoo');
      const inspect = stdout.inspect();
      t.throws(tester);
      inspect.restore();
      t.is(inspect.output.length, 2);
      t.is(inspect.output[1].trim(), 'woohoo');
      t.truthy(regex.test(stripColor(inspect.output[0])));
    });

    test('when error constructor is passed as the first argument', (t) => {
      const tester = () => t.context.log(new Error('woohoo'));
      const inspect = stdout.inspect();
      t.throws(tester);
      inspect.restore();
      t.is(inspect.output.length, 2);
      t.is(inspect.output[1].trim(), 'Error: woohoo');
      t.truthy(regex.test(stripColor(inspect.output[0])));
    });
  });

  test('time and timeEnd', async (t) => {
    const time = t.context.log('time', 'woohoo');
    t.is(time.constructor.name, 'Logger');
    await delay(200);
    const end = t.context.log('timeEnd', 'woohoo');
    const woohoo = parseFloat(end.match(/\+([0-9\.]+)/)[1]);
    t.truthy(woohoo > 190);
  });
});


test.serial.group('time', (test) => {
  test('throws when no label is passed (time)', (t) => {
    const tester = () => t.context.time();
    const inspect = stdout.inspect();
    t.throws(tester);
    inspect.restore();
    t.not(stripColor(inspect.output[0]), inspect.output[0]);
    t.truthy(/^\[[0-9]+:[0-9]+:[0-9]+\]\s.+\serror:\s*$/.test(stripColor(inspect.output[0])));
    t.is(inspect.output.length, 2);
    t.is(inspect.output[1].split('\n')[0], 'You must pass in a label for `Logger.prototype.time`');
  });

  test('throws when no label is passed (timeEnd)', (t) => {
    const tester = () => t.context.timeEnd();
    const inspect = stdout.inspect();
    t.throws(tester);
    inspect.restore();
    t.not(stripColor(inspect.output[0]), inspect.output[0]);
    t.truthy(/^\[[0-9]+:[0-9]+:[0-9]+\]\s.+\serror:\s*$/.test(stripColor(inspect.output[0])));
    t.is(inspect.output.length, 2);
    t.is(inspect.output[1].split('\n')[0], 'You must pass in a label for `Logger.prototype.timeEnd`');
  });

  test('returns this', (t) => {
    const actual = t.context.time('returns');
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
        t.context.time(expected);
        await delay(time);
        let actual = t.context.timeEnd(expected);
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
