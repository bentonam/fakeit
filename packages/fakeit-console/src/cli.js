// this is not a function that is to be called by anything other than the `bin/fakeit` file in the project
export default async function(commander) {
  // i.e. `fakeit console`
  commander
    .command('console')
    .option('-h, --no-highlight', 'This turns off the cli-table when a csv format', Boolean, false)
    .description('outputs the result to the console')
    .action(async (...args) => {
      console.log('@fakeit/console plugin specific logic')
    });
}
