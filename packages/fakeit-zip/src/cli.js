// this is not a function that is to be called by anything other than the `bin/fakeit` file in the project
export default async function(commander) {
  // i.e. `fakeit zip`
  commander
    .command('zip')
    .option('-a, --archive [file.zip]', 'If an archive file is passed then the data will be output as a zip file', '')
    .description('outputs the result to the console')
    .action(async (...args) => {
      console.log('@fakeit/zip plugin specific logic')
    });
}
