// @flow

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
      .command('file')
      .option(
        '-h, --no-highlight',
        'This turns off the cli-table when a csv format',
        Boolean,
        false,
      )
      .description('outputs the result a single file')
      .action(() => {
        console.log('@fakeit/file plugin specific logic')
      })
  })
}
