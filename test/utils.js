/* eslint-disable func-names, babel/object-shorthand */

var joi = require('joi');
var to = require('to-js').default;
var p = require('path').join;
var _ = require('lodash');
var globby = require('globby');

/* istanbul ignore next: testing util */
/// @name models
/// @description This will setup the models function
/// @arg {object} options
/// ```js
/// {
///   root: process.cwd(), // the root of the modules that are being tested
///   modules: '', // The path to the modules to test
///   schemas_todo: {}, // stores the modules todo
///   // the function to get the validation file for the model
///   validation: function(model) {
///     return model.replace(/models(.*)\.yaml/g, 'validation$1.data.js');
///   }
/// }
/// ```
/// @returns {function} - function that loops over each model that was found
module.exports.models = function(options) {
  options = to.extend({
    root: process.cwd(), // the root of the modules that are being tested
    modules: '', // The path to the modules to test
    schemas_todo: {}, // stores the modules todo
    // the function to get the validation file for the model
    validation: function(model) {
      return model.replace(/models(.*)\.yaml/g, 'validation$1.data.js');
    }
  }, options);

  options.modules = globby.sync(options.modules, { cwd: options.root });

  // variable to store schemas so that after they've been required once
  // they don't have to be required again. The keys are the same as the model path
  // starting from `fakeit_root`.
  var schemas = {};

  ///# @name Each model
  ///# @description
  ///# This will loop through each of the models in the `fakeit_root` to run tests for each one.
  ///# It makes it easier to test each model against the different types of functionality.
  ///# @arg {function} cb - The function that's used to test each of the models
  ///# @arg {number, string, array} match [null]
  ///# If you only want certain tests to run you can pass in a number which will match the index of the item.
  ///# If you pass in a string it will only run the test that matches the string.
  ///# If you pass in an array it will only run the tests that match an item in the array.
  ///# The items in the array can either be numbers or strings
  ///# @arg {array, string} todo [[]] - The models todo
  ///#
  ///# @returns {function} -
  ///# This is the main group function that will create a new group test for you.
  ///# This is something that runs automatically, but if for some reason you have other tests
  ///# in your group you'll need to trigger it and pass in the `test` variable to it.
  ///#
  ///# @markup {js} Example
  ///# import test from 'ava-spec'
  ///# import { stdout } from 'test-console'
  ///#
  ///# test.group('console', models(async (t, model) => {
  ///#   // `t` is the assertion object for each test
  ///#   // `model` is the current model being run
  ///#
  ///#   t.context.defaults.output = 'console'
  ///#
  ///#   const inspect = stdout.inspect()
  ///#   await t.context.fakeit.generate(model, t.context.defaults)
  ///#   inspect.restore()
  ///#   const actual = to.object(stripColor(inspect.output[2].trim()))[0]
  ///#
  ///#   // make sure that you return the actual result
  ///#   // because it will be run through validation
  ///#   return actual
  ///# }))
  function models(cb, match = null, todo = []) {
    todo = to.array(todo);
    return function(test) {
      // loop over all the globs
      options.modules.forEach(function(model) {
        // check if there's a matching test
        const should_test = match === null ? true : !!to.flatten([ match ]).map(function(item) { // eslint-disable-line
          if (typeof item === 'number') {
            item = options.modules[item];
          }
          return !!item && item.includes(model);
        }).filter(Boolean).length;

        // if the model isn't in the todo list then run the tests
        if (
          should_test && !todo.includes(model)
        ) {
          let schema;
          // get the schema to use for validating that the output is correct
          try {
            schemas[model] = schema = schemas[model] || require(p(options.root, options.validation(model)));
          } catch (e) {
            schemas[model] = schema = {};
          }

          // eslint-disable-next-line no-underscore-dangle
          const schema_keys = schema.isJoi ? _.map(schema._inner.children, 'key') : to.keys(schema);
          test(model, function(t) { // eslint-disable-line
            // run the call back with the `t` assertion object and the current model
            // assume that the callback will return a promise
            return cb(t, model)
              .then(function(actual) {
                // find the keys that still need to be validated
                var omitted = _.difference(to.keys(actual), schema_keys);
                // test the keys that exsit
                const picked = _.pick(actual, schema_keys);

                // if there're any keys that still need validation add them
                // to the schema_keys to test at the end
                if (omitted.length) {
                  const key = t.title.replace('fakit generate', '').trim();
                  options.schemas_todo[key] = omitted;
                }

                // validate the object that can be validated
                const validate = (err) => {
                  if (err) {
                    let match = err.message.match(/(?:")[^"]+"/);
                    if (match) {
                      match = match[0].slice(1, -1);
                      if (picked[match]) {
                        console.log(picked[match]);
                      }
                    }
                    t.fail(`${model} isn't valid ${err.message}`);
                  } else {
                    t.pass(`${model} is valid`);
                  }
                };
                if (schema.isJoi) {
                  schema.validate(picked, validate);
                } else {
                  joi.validate(picked, schema, validate);
                }
              })
              .catch(function(err) {
                t.fail(err);
              });
          });
        } else if (
          match === null &&
          todo.includes(model)
        ) {
          // if there's no specific match to test at they're
          // on the todo list then add that model to todo tests
          test.todo(model);
        }
      });
    };
  };

  models.files = options.modules;
  return models;
};
