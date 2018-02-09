// @flow

import chalk from 'chalk'

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
      .command('sync-gateway')
      .option('-s, --server [server]', `The server address (${chalk.dim('127.0.0.1')})`)
      .option('-b, --bucket [bucket]', `The bucket name (${chalk.dim('default')})`)
      .option('-u, --username [username]', 'the username to use (optional)')
      .option('-p, --password [password]', 'the password for the account (optional)')
      .option('-t, --timeout [timeout]', 'timeout for the servers')
      .description('This will output to a Couchbase Sync-Gateway Server')
      .action(() => {
        console.log('@fakeit/sync-gateway plugin specific logic')
      })
  })
}
