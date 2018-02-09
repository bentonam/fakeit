// @flow

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
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
  })
}
