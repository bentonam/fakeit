// this is not a function that is to be called by anything other than the `bin/fakeit` file in the project
export default async function(commander) {
  // i.e. `fakeit csv`
  commander
    .command('csv')
    .option('-h, --no-column-headings', 'Whether or not to enable column headings in the file', Boolean, false)
    .description('outputs the result to a csv file')
    .action(async (...args) => {
      console.log('@fakeit/csv plugin specific logic')
    });
}
