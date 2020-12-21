import { extend } from 'lodash';
import default_options from './default-options';
import Base from '../base';
import couchbase from 'couchbase';

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

    const { username, password } = this.output_options;
    let couchbaseOptions = {};

    if (username || password) {
      couchbaseOptions = {
        username,
        password
      };
    }

    this.cluster = new couchbase.Cluster(
      this.output_options.server,
      couchbaseOptions
    );

    this.collection = null;
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
  async prepare() {
    this.preparing = true;
    this.preparing = await this.setup();
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

    const { server, bucket, scopeName, collectionName } = this.output_options;

    return new Promise((resolve, reject) => {
      try {
        this.bucket = this.cluster.bucket(bucket);

        // Check if the user configured a collection and/or a scope. If so,
        // use them, otherwise use the default scope and default collection.
        if (scopeName && collectionName) {
          this.bucket.scope(scopeName).collection(collectionName);
        } else if (collectionName) {
          this.collection = this.bucket.collection(collectionName);
        } else {
          this.collection = this.bucket.defaultCollection();
        }
      } catch (err) {
        console.log(err);

        reject(err);
      }

      this.log('verbose', `Connection to '${bucket}' bucket at '${server}' was successful`);

      this.prepared = true;
      this.bucket.connected = true;
      resolve();
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

    // upserts a document into couchbase
    return this.collection.upsert(id, data);
  }

  ///# @name finalize
  ///# @description
  ///# This disconnect from couchbase if it's connected
  ///# @async
  async finalize() {
    if (this.bucket && this.bucket.connected) {
      await this.cluster.close();
      this.bucket.connected = false;
    }
  }
}