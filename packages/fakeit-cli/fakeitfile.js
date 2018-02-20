function someplugin (config) {
  config.cli((program, next) => {
    return program
      .command('ink-test')
      .option('--woohoo', 'some really cool stuff should happen')
      .action(next('ink-test'))
  })

  config.output('ink-test', () => {
    console.log("woohoo I'm outputting something")
  })
}

module.exports = {
  plugins: [ someplugin ],
}
