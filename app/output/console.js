import { extend, keys, values } from 'lodash';
import highlight from 'highlight-es';
import default_options from './default-options';
import Base from '../base';
import { parsers } from '../utils';
import Table from 'cli-table';
import chalk from 'chalk';

/// @name Console
/// @page api
/// @description This is used to output data to the console
export default class Console extends Base {
  ///# @name constructor
  ///# @arg {object} options - The base options
  ///# @arg {object} output_options - The output options
  constructor(options = {}, output_options = {}) {
    super(options);
    this.output_options = extend(
      {
        highlight: true,
      },
      default_options,
      output_options,
    );

    this.prepared = false;
  }

  ///# @name prepare
  ///# @description
  ///# This is used to prepare the saving functionality that is determined by the
  ///# options that were passed to the constructor.
  ///# It sets a variable of `this.preparing` that ultimately calls `this.setup` that returns a promise.
  ///# This way when you go to save data it, that function will know if the setup is complete or not and
  ///# wait for it to be done before it starts saving data.
  ///# @returns {promise} - The setup function that was called
  ///# @async
  prepare() {
    this.preparing = true;
    this.preparing = this.setup();
    return this.preparing;
  }

  ///# @name setup
  ///# @description
  ///# This is used to setup the saving function that will be used.
  async setup() {
    // if this.prepare hasn't been called then run it first.
    if (this.preparing == null) {
      return this.prepare();
    }

    return new Promise((resolve) => {
      // theres noting to setup for the Console output
      // this is just here so that all the Outputters are setup the same
      process.nextTick(() => {
        this.prepared = true;
        resolve();
      });
    });
  }

  ///# @name output
  ///# @description
  ///# This is used to output the data that's passed to it
  ///# @arg {string} id - The id to use for this data
  ///# @arg {object, array, string} data - The data that you want to be saved
  ///# @async
  async output(id, data) {
    if (this.prepared !== true) {
      if (this.preparing == null) {
        this.prepare();
      }
      await this.preparing;
    }

    if (this.output_options.highlight) {
      if (this.output_options.format === 'csv') {
        const table = new Table();
        data = await parsers.csv.parse(data);

        table.push(keys(data[0]).map((key) => chalk.bold(key)));
        data.forEach((obj) => table.push(values(obj)));
        data = table;
      } else {
        data = highlight(data);
      }

      data += '';
    }

    return data;
  }
}
