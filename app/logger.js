import to from 'to-js';
import chalk from 'chalk';
import symbols from 'log-symbols';
import perfy from 'perfy';
symbols.warn = symbols.warning;
symbols.ok = symbols.okay = symbols.success;

/// @name Logger
/// @description
/// This is the main logger for the application
export default class Logger {
  ///# @name constructor
  ///# @arg {object} options [{ log: true, verbose: false, timestamp: true }]
  constructor(options = {}) {
    this.options = to.extend({
      log: true,
      verbose: false,
      timestamp: true,
    }, options);

    // ensure that if `verbose` is true then `log` must also be true
    if (this.options.verbose) {
      this.options.log = true;
    }

    ///# @name log_types
    ///# @static
    ///# @type {object}
    ///# @raw-code
    this.log_types = {
      error: 'red',
      warning: 'yellow',
      success: 'green', // possibly remove
      info: 'blue',
      verbose: 'magenta',
      log: 'gray'
    };
  }

  ///# @name log
  ///# @description This is used to control the logging of an app
  ///# @arg {*} type
  ///# If this is a `string` and matches `error`, `warning`, `success`, `info`, `verbose`, `log` then it
  ///# will add special characters before the rest of the log depending on the type that was passed.
  ///# If it's not one of these then the type will default to `log` and the value you passed will be
  ///# prepended to the rest of the arguments
  ///# @arg {*} ...args - Any other arguments that you wish to pass
  ///# @chainable
  log(type, ...args) {
    if (type instanceof Error) {
      args.unshift(type);
      type = 'error';
    }
    if (this.options.log || type === 'error') {
      if ([ 'time', 'timeEnd' ].includes(type)) {
        return this[type](...args);
      }

      if (!to.keys(this.log_types).includes(type)) {
        args.unshift(type);
        type = 'log';
      }
      args = args.join('\n');

      if (type === 'verbose') {
        if (!this.options.verbose) return;
        type = 'console';
      }

      const stamp = this.stamp(type);

      // print the current time.
      if (stamp) {
        process.stdout.write(stamp);
      }

      console.log(args);

      if (type === 'error') {
        throw new Error(args);
      }
    }
    return this;
  }

  ///# @name stamp
  ///# @description This will generate a colorized timestamp and message depending on the time that's passed.
  ///# @arg {string} type ['log'] - This determins the type of stamp to return. This can be any of the types that you can pass to `this.log`
  ///# @returns {string} The stamp that was generated.
  stamp(type = 'log') {
    const now = new Date();
    const timestamp = [ now.getHours(), now.getMinutes(), now.getSeconds() ].join(':');
    const color = this.log_types[type];
    let stamp = this.options.timestamp ? `[${chalk.magenta(timestamp)}] ` : '';
    if (symbols[type]) {
      stamp += `${symbols[type]} `;
    }
    if ([ 'error', 'warning', 'info' ].includes(type)) {
      stamp += `${chalk[color](type)}: `;
    }

    return stamp;
  }

  ///# @name time
  ///# @description
  ///# This does the same thing as `console.time`.
  ///# @arg {string} label - This is the label for your timed event
  ///# @chainable
  time(label) {
    if (!label) {
      return this.log('error', 'You must pass in a label for `Logger.prototype.time`');
    }
    perfy.start(label);
    return this;
  }

  ///# @name timeEnd
  ///# @description
  ///# This does the same thing as `console.timeEnd`.
  ///# @arg {string} label - This must be the same label that was passed to the associated `this.time` function
  ///# @returns {string} - The total time it took to run the process
  timeEnd(label) {
    if (!label) {
      return this.log('error', 'You must pass in a label for `Logger.prototype.timeEnd`');
    }
    const result = perfy.end(label);
    let suffix = 's';
    let time;
    // convert to milliseconds
    if (result.time < 1) {
      time = result.milliseconds;
      suffix = 'ms';
    } else {
      time = result.time;
    }

    time = `+${time.toFixed(2)}${suffix}`;
    return `${chalk.cyan(time)}`;
  }
}
