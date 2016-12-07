import { extend } from 'lodash';
import default_options from './default-options';
import Base from '../base';
import couchbase from 'couchbase';
import promisify from 'es6-promisify';


/// @name Couchbase
/// @page api
/// @description This is used to output data to the Couchbase
export default class Couchbase extends Base {
  ///# @name constructor
  ///# @arg {object} options - The base options
  ///# @arg {object} output_options - The output options
  constructor(options = {}, output_options = {}) {
    super(options);
    this.output_options = extend({}, default_options, output_options);

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

    const { server, bucket, password, timeout } = this.output_options;

    const cluster = new couchbase.Cluster(server);
    cluster._openBucket = cluster.openBucket; // eslint-disable-line no-underscore-dangle
    cluster.openBucket = promisify(cluster.openBucket);

    this.bucket = await cluster.openBucket(bucket, password);

    this.bucket._upsert = this.bucket.upsert; // eslint-disable-line no-underscore-dangle
    this.bucket.upsert = promisify(this.bucket.upsert);

    this.log('verbose', `Connection to '${bucket}' bucket at '${server}' was successful`);

    if (timeout) {
      this.bucket.operationTimeout = timeout;
    }

    this.prepared = true;
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

    // upserts a document into couchbase
    return this.bucket.upsert(id, data);
  }

  ///# @name finalize
  ///# @description
  ///# This disconnect from couchbase if it's connected
  ///# @async
  async finalize() {
    if (this.bucket.connected) {
      this.bucket.disconnect();
    }
  }
}
