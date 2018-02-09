// @flow
import chalk from 'chalk'

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
      .command('http')
      .option('-s, --server [server]', `The server address (${chalk.dim('127.0.0.1')})`)
      .option('-b, --bucket [bucket]', `The bucket name (${chalk.dim('default')})`)
      .option('-u, --username [username]', 'The username to use (optional pre-5.0)')
      .option('-p, --password [password]', 'the password for the account (optional)')
      .option('-t, --timeout [timeout]', `timeout for the servers (${chalk.dim(5000)})`, Number)
      .description('Outputs the results to an HTTP(s) endpoint')
      .action(() => {
        console.log('@fakeit/http plugin specific logic')
      })
  })
}
