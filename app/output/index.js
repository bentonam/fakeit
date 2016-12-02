////
/// @page api
////

import path from 'path';
import { extend } from 'lodash';
import { is } from 'to-js';
import Base from '../base';
import default_options from './default-options';

export const output_types = [ 'return', 'console', 'couchbase', 'sync-gateway' ];

/// @name Output
/// @description
/// This is used to output data into different environments
export default class Output extends Base {
  ///# @name constructor
  ///# @arg {object} options [{}] - The options that apply to Base
  ///# @arg {object} output_options - The options for how you want save data
  ///# {
  ///#
  ///# }
  ///# @todo update the output_options to have the final options and descriptions of each
  constructor(options = {}, output_options = {}) {
    super(options);

    this.output_options = extend({}, default_options, output_options);

    this.validateOutputOptions();

    this.prepared = false;
  }

  ///# @name validateOutputOptions
  ///# @description This is used to validate the output options
  ///# @throws {error} - If an option that was passed is invalid.
  validateOutputOptions() {
    for (let option in this.output_options) {
      if (this.output_options.hasOwnProperty(option)) {
        try {
          validate[option](this.output_options[option], this.output_options);
        } catch (e) {
          this.log('error', e);
        }
      }
    }
  }
}


/// @name Output validate
/// @description This holds the different options that can be passed to the Output constructor
/// @type {object}
export const validate = {
  ///# @name format
  ///# @description Used to validate the format option
  ///# @arg {string} option - The option to validate against
  ///# @throws {error} - If the format option that was pass was invalid
  format(option) {
    const formats = [ 'json', 'csv', 'yaml', 'yml', 'cson' ];
    if (
      isString(option, 'format') &&
      formats.includes(option)
    ) {
      return;
    }
    throw new Error(`You must use one of the following formats ${formats}. You passed ${option}`);
  },

  ///# @name spacing
  ///# @description Used to validate the spacing option
  ///# @arg {number} option - The option to validate against
  ///# @throws {error} - If the spacing option that was pass was invalid
  spacing(option) {
    if (!is.number(option)) {
      throw new Error('The spacing option must be a number');
    }
  },

  ///# @name output
  ///# @description Used to validate the output option
  ///# @arg {string} option - The option to validate against
  ///# @throws {error} - If the output option that was pass was invalid
  output(option) {
    if (!isString(option, 'output')) return;

    if (
      output_types.includes(option) ||
      !path.extname(option)
    ) {
      return;
    }

    throw new Error(`The output option must be ${output_types.join(', ')}, or a folder path`);
  },

  ///# @name limit
  ///# @description Used to validate the limit option
  ///# @arg {number} option - The option to validate against
  ///# @throws {error} - If the limit option that was pass was invalid
  limit(option) {
    if (is.number(option)) {
      return;
    }
    throw new Error('The limit option must be a number');
  },

  ///# @name archive
  ///# @description Used to validate the archive option
  ///# @arg {boolean} option - The option to validate against
  ///# @throws {error} - If the archive option that was pass was invalid
  archive(option, { output }) {
    if (is.boolean(option)) {
      if (
        option &&
        [ 'return', 'console' ].includes(output)
      ) {
        throw new Error(`You can\'t have an archive file when you have the output option set to ${output}`);
      }
      return;
    }
    throw new Error('The archive option must be a boolean');
  },

  ///# @name server
  ///# @description Used to validate the server option
  ///# @arg {string} option - The option to validate against
  ///# @arg {object} options - The other options for that are being validated
  ///# @throws {error} - If the server option that was pass was invalid
  server(option, { output, archive }) {
    // ignore this validation if the output isn't one of these
    if (!isServer(output)) return;

    if (archive === true) {
      throw new Error(`The archive option can't be used with ${option}`);
      return;
    }

    isString(option, 'server');
  },

  ///# @name bucket
  ///# @description Used to validate the bucket option
  ///# @arg {string} option - The option to validate against
  ///# @arg {object} options - The other options for that are being validated
  ///# @throws {error} - If the bucket option that was pass was invalid
  bucket(option, { output }) {
    // ignore this validation if the output isn't one of these
    if (!isServer(output)) return;

    isString(option, 'bucket');
  },

  ///# @name username
  ///# @description Used to validate the username option
  ///# @arg {string} option - The option to validate against
  ///# @arg {object} options - The other options for that are being validated
  ///# @throws {error} - If the username option that was pass was invalid
  username(option, { output }) {
    // ignore this validation if the output isn't one of these
    if (!isServer(output)) return;

    isString(option, 'username');
  },

  ///# @name password
  ///# @description Used to validate the password option
  ///# @arg {string} option - The option to validate against
  ///# @arg {object} options - The other options for that are being validated
  ///# @throws {error} - If the password option that was pass was invalid
  password(option, { output }) {
    // ignore this validation if the output isn't one of these
    if (!isServer(output)) return;

    isString(option, 'password');
  },
};


/// @name isServer
/// @description This is used to check if the output is `sync-gateway` or `couchbase`
/// @arg {string} output - The output that's being used
/// @returns {boolean} - If true the output option is a server
export function isServer(output) {
  return [ 'sync-gateway', 'couchbase' ].includes(output);
}

/// @name isString
/// @description This is used to check if an option is a string and that it has a length
/// @arg {*} option - The option that's passed
/// @arg {string} name - The name of the validate function that this is called in
/// @returns {boolean} - If true the option that was passed is a string and has a length.
/// @throws {error} - If the option isn't a string
/// @throws {error} - If the option is a string and doesn't have a length
export function isString(option, name = '') {
  if (!!name) {
    name = ` ${name} `;
  }
  if (!is.string(option)) {
    throw new Error(`The${name}option must be a string`);
    return false;
  } else if (
    is.string(option) &&
    !option.length
  ) {
    throw new Error(`The${name}option must have a length`);
    return false;
  }
  return true;
}
