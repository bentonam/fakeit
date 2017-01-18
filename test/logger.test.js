import ava from 'ava-spec';
import Logger from '../dist/logger';
import to from 'to-js';
import { stdout } from 'test-console';
import { stripColor } from 'chalk';
import { PassThrough as PassThroughStream } from 'stream';
import _ from 'lodash';
import getStream from 'get-stream';
const test = ava.group('logger:');
const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

test.beforeEach((t) => {
  t.context = new Logger();
});


test('functions', (t) => {
  t.deepEqual(
    to.keys(Logger.prototype).sort(),
    [ 'constructor', 'log', 'spinner', 'stamp', 'time', 'timeEnd' ].sort()
  );
});


test.group('options', (test) => {
  test('none', (t) => {
    t.deepEqual(t.context.options, { log: true, verbose: false, spinners: true, timestamp: true });
  });

  test('log is false', (t) => {
    const logger = new Logger({ log: false });
    t.deepEqual(logger.options, { log: false, verbose: false, spinners: false, timestamp: true });
  });

  test('log is false and verbose is true', (t) => {
    const logger = new Logger({ log: false, verbose: true });
    t.deepEqual(logger.options, { log: true, verbose: true, spinners: true, timestamp: true });
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
      let [ message, ...err_lines ] = inspect.output[1].split('\n');
      t.is(message.trim(), 'Error: woohoo');
      err_lines.forEach((line) => {
        line = line.trim();
        if (line) {
          t.is(line.slice(0, 2), 'at');
        }
      });
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


test.serial.group('spinner', (test) => {
  function getPassThroughStream() {
    const stream = new PassThroughStream();
    stream.clearLine = _.noop;
    stream.cursorTo = _.noop;
    return stream;
  }

  test('returns a modified instance of Ora', (t) => {
    const actual = t.context.spinner('instance');
    t.is(actual.constructor.name, 'Ora');
    t.is(actual.title, 'instance');
    t.is(actual.text, 'instance');
    t.is(typeof actual.originalStart, 'function');
    t.is(typeof actual.originalStop, 'function');
    t.truthy(/this\.originalStop\(\);/.test(actual.stopAndPersist.toString()));
  });

  test.serial('start/stop/stopAndPersist do nothing in TTY env', async (t) => {
    const actual = t.context.spinner('woohoo');
    const inspect = stdout.inspect();
    const start_result = actual.start();
    await delay(200);
    const stop_result = actual.stop();
    actual.start();
    const stop_and_persist_result = actual.stopAndPersist('✔');
    inspect.restore();
    t.is(start_result.constructor.name, 'Ora');
    t.is(stop_result.constructor.name, 'Ora');
    t.is(stop_and_persist_result.constructor.name, 'Ora');
    t.deepEqual(inspect.output, []);
  });

  test('start/stop custom stream', async (t) => {
    const stream = getPassThroughStream();
    const actual = t.context.spinner({ stream, text: 'stop__', color: false, enabled: true });
    actual.start();
    await delay(200);
    actual.stop();
    stream.end();
    const output = await getStream(stream);
    output.trim().split('__').filter(Boolean).forEach((state) => {
      const [ frame, text ] = state.split(/\s+/);
      t.truthy(actual.spinner.frames.includes(frame));
      t.is(text, 'stop');
    });
  });

  test('start/stop custom stream with verbose option', async (t) => {
    const stream = getPassThroughStream();
    t.context.options.verbose = true;
    const actual = t.context.spinner({ stream, text: 'stop__', color: false, enabled: true });
    actual.start();
    await delay(200);
    actual.stop();
    stream.end();
    const states = stripColor(await getStream(stream)).trim().split('__').filter(Boolean);
    const last_state = states.splice(-2, 2).join('');
    states.filter(Boolean).forEach((state) => {
      const [ frame, text ] = state.split(/\s+/);
      t.truthy(actual.spinner.frames.includes(frame));
      t.is(text, 'stop');
    });
    {
      const [ check, text, time ] = last_state.split(/\s+/);
      t.is(check, '✔');
      t.is(text, 'stop');
      t.truthy(/^\+2[0-9]{2}\.[0-9]{2}ms$/.test(time));
    }
  });

  test.serial('fail custom stream', async (t) => {
    const stream = getPassThroughStream();
    const [ one, two, three ] = [ 'one', 'two', 'three' ].map((str) => t.context.spinner({ stream, text: `${str}__`, color: false, enabled: true }));
    const inspect = stdout.inspect();
    one.start();
    two.start();
    three.start();
    t.truthy(one.id);
    t.truthy(two.id);
    t.truthy(three.id);
    const tester = () => three.fail('failed');
    t.throws(tester);
    inspect.restore();
    t.is(one.id, null);
    t.is(two.id, null);
    t.is(three.id, null);
    t.truthy(/error: failed/.test(stripColor(inspect.output.join(''))));
    stream.end();
    const states = stripColor(await getStream(stream)).trim().split('__').filter(Boolean);
    const last_state = states.pop();
    states.forEach((state) => {
      const [ frame, text ] = state.split(/\s+/);
      t.truthy(one.spinner.frames.includes(frame));
      t.truthy([ 'one', 'two', 'three' ].includes(text));
    });

    {
      const [ check, text ] = last_state.split(/\s+/);
      t.is(check, '✖');
      t.is(text, 'three');
    }
  });

  test('spinner already exists so return it', (t) => {
    t.deepEqual(t.context.spinners, {});
    _.times(2, () => t.context.spinner('exists'));
    t.deepEqual(_.keys(t.context.spinners), [ 'exists' ]);
  });
});
