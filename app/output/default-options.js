module.exports = {
  // this is the format to output it in
  // available formats `json`, `csv`, `yaml`, `yml`, `cson`
  format: 'json',

  // the character(s) to use for spacing
  spacing: 2,

  // The type of output to use
  // avaiable
  // `return`: This will return as a promise
  // `console`: This will output to the console
  // `couchbase`: This will output to couch base. This requires extra options. If those options aren't passed you will be prompted for them.
  // `sync-gateway`: no idea
  // `directory`: The directory path to output the files
  output: 'return',

  // limit how many files are output at a time
  limit: 100,

  // avaiable formats `zip`
  // the file name of the zip file
  // This can be used inconjuction with any other type
  archive: '',
  // These options are used if the output is `sync-gateway`, or `couchbase`
  // the server address
  server: '127.0.0.1',
  // the bucket name
  bucket: 'default',
  // the username to use
  username: '',
  // the password for the account
  password: '',
};
