// this is not a function that is to be called by anything
// other than the `bin/fakeit` file in the project
export default function (commander) {
  // i.e. `fakeit directory`
  commander
    .command('directory [<dir|file.zip>] [<models...>]')
    .alias('folder')
    .option(
      '-a, --archive [file.zip]',
      'If an archive file is passed then the data will be output as a zip file',
      '',
    )
    .description('Output the file(s) into a directory')
    .action(() => {
      console.log('@fakeit/directory plugin specific logic')
    })
}
