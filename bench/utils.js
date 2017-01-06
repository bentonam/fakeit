/* eslint-disable func-names, babel/object-shorthand */

var to = require('to-js');
to = to.default;
var chalk = require('chalk');
var Benchmark = require('benchmark');
var Table = require('cli-table');

/// @name suite
/// @description
/// This is used to run benchmark tests
/// @arg {object, function} obj
/// If a object is passed then then objects items are used as the benchmark tests
/// If a function is passed it will run it with the `t`, and `t.context.suite` as the arguments
/// If you want to add options or tests in the `t.context.suite.add` way. This function can return a promise.
/// If you return a function or an object they will be added to the suite as benchmark tests
/// @arg {object} opts [{ async: true, minSamples: 100 }] - The options to pass to Benchmark.Suite
/// @markup {js}
/// import test from 'ava-spect';
/// import { benchmark } from './utils';
/// test('some benchmarks', benchmark(async (t, suite) => {
///   // `t` is the assertion object for each test
///   // `suite` is current `Benchmark.Suite` it can also be found under `t.context.suite`
///   await somethingAsync();
///   return {
///     one() {
///       return !/o/.test('Hello World!')
///     },
///     two() {
///       var result = []
///       for (var i = 0; i < 20000; i++) {
///         result.push('Hello World!'.match(/o/))
///       }
///       return result
///     },
///     three() {
///       return !/o/.test('Hello World!')
///     },
///   }
/// }))
/// @async
/* istanbul ignore next: testing util */
module.exports.benchmark = function benchmark(obj, opts) {
  opts = to.extend({ async: true, minSamples: 1 }, opts || {});

  return function(t) {
    t.context.suite = new Benchmark.Suite({ async: true, minSamples: 1 });

    if (to.type(obj) === 'function') {
      obj = obj(t, t.context.suite);
    }

    if (to.type(obj) === 'function') {
      var temp = {};
      temp[obj.name || 'annonyms'] = obj;
      obj = temp;
    }

    if (typeof obj.then !== 'function') {
      obj = Promise.resolve(obj);
    }

    function run() {
      return new Promise(function(resolve, reject) {
        let result = [];
        t.context.suite
          .on('cycle', function(e) {
            console.log('    finished:', e.target.name.replace('_', ''));
            var str = e.target.toString();
            result.push(str);
          })
          .on('error', function(e) {
            reject(e);
          })
          .on('complete', function() {
            resolve(result);
          })
          .run(opts);
      });
    };

    return obj
      .then(function(items) {
        if (items != null && to.type(items) !== 'object') {
          throw new Error('Items must be an object or a function that returns and object');
        }

        to.each(items || {}, function(item) {
          t.context.suite.add(item.key, item.value);
        });
        return run()
          .then(function(benchmarks) {
            return [ benchmarks, items ];
          });
      })
      .then(function(item) {
        var benchmarks = item[0];
        var items = item[1];
        var table = new Table();
        table.push([ 'name', 'function', 'opts/sec', 'samples', 'fastest/slowest' ]);
        function getOps(str) {
          return parseInt(str.split(' x ')[1].match(/([0-9,]+)/)[0].replace(',', ''));
        }
        function getName(str) {
          return str.split(/\s*x\s*/)[0].trim();
        }
        var fastest_cycles = t.context.suite.filter('fastest').map('name');
        var fastest = benchmarks
          .filter(function(str) {
            return fastest_cycles.indexOf(getName(str)) > -1;
          })
          .map(getOps)
          .sort();
        fastest = fastest[fastest.length - 1];
        benchmarks = benchmarks.forEach(function(mark) {
          var original = mark;
          mark = mark.split(/\s*x\s*/);
          var name = mark[0];
          var fn = (items[name] || '').toString().split('\n');
          fn = fn[0] + '\n' + to.normalize(fn.slice(1));
          mark = mark[1].split(/\%\s*/);
          var ops = (mark[0] + '%').replace(/\s*ops\/sec\s*/, ' ');
          var ops_number = getOps(original);
          var samples = mark[1].match(/[0-9]+/)[0];
          var extra = '';

          if (ops_number === fastest) {
            extra = chalk.green('fastest');
          } else {
            var slower = (100 - ops_number * 100 / fastest).toFixed(1);
            extra = chalk.red(slower + '% slower');
          }
          table.push([ name.replace('_', ''), fn, ops, samples, extra ]);
        });
        console.log('\n' + table.toString());
      });
  };
};
