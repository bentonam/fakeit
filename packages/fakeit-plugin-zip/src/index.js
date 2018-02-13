// @flow

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
      .command('zip')
      .option(
        '-a, --archive [file.zip]',
        'If an archive file is passed then the data will be output as a zip file',
        '',
      )
      .description('outputs the result to the console')
      .action(() => {
        console.log('@fakeit/zip plugin specific logic')
      })
  })
}
