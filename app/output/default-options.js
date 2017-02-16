module.exports = {
  // this is the format to output it in
  // available formats `json`, `csv`, `yaml`, `yml`, `cson`
  format: 'json',

  // the character(s) to use for spacing
  spacing: 2,

  // The type of output to use. Below are the available types
  // `return`: This will the data in an array
  // `console`: This will output the data to the console
  // `couchbase`: This will output the data to a Couchbase server.
  // `sync-gateway`: This will output the data to a Couchbase Sync Gateway server
  // `directory`: The directory path to output the files (aka `path/to/the/destination`)
  output: 'return',

  // limit how many files are output at a time, this is useful
  // to not overload a server or lock up your computer
  limit: 100,

  // this is used in the console output and if true it will
  // format and colorize the output
  highlight: true,

  // the file name of the zip file. Currently this can only be used if you're
  // outputting the data to a directory. It can't be used to output a zip file
  // to a server, the console, or returned. (aka `archive.zip`)
  archive: '',

  // These options are used if the `output` option is `sync-gateway`,
  // or `couchbase`. Otherwise they're ignored.
  server: '127.0.0.1', // the server address to use for the server
  bucket: 'default', // the bucket name
  username: '', // the username to use if applicable
  password: '', // the password for the account if applicable
  timeout: 5000, // timeout for the servers
};
