import path from 'path';
import to from 'to-js';
import * as utils from './utils';

/// @name Base
/// @page api
/// @description
/// This holds the base functions that each of the classes in the application will exten
export default class Base extends utils.Logger {
  /// @name constructor
  /// @arg {object} options - Global options for the different classes
  /// @raw-code
  constructor(options = {}) {
    super(options);
    this.options = to.extend({
      root: process.cwd(),
      log: true,
      verbose: false,
      timestamp: true,
    }, this.options || {});
    this.options = to.extend(this.options, options);

    if (this.options.verbose) {
      this.options.log = true;
    }
  }

  ///# @name resolvePaths
  ///# @description
  ///# This is ued to parsed paths that are passed to the different functions
  ///# @arg {string, array} paths - The paths to normalize
  ///# @arg {}
  resolvePaths(paths) {
    if (!paths) {
      return [];
    }
    return to.string(paths, ', ')
      .split(/\s*(?:,| )\s*/)
      .filter(Boolean)
      .map((file) => {
        if (path.isAbsolute(file)) {
          return file;
        }
        return path.join(this.options.root, file);
      });
  }
}
