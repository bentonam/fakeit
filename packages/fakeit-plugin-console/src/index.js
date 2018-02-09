// @flow

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    // i.e. `fakeit console`
    caporal
      .command('console')
      .option(
        '-h, --no-highlight',
        'This turns off the cli-table when a csv format',
        Boolean,
        false,
      )
      .description('outputs the result to the console')
      .action(() => {
        console.log('@fakeit/console plugin specific logic')
      })
  })
}
