// this is not a function that is to be called by
// anything other than the `bin/fakeit` file in the project
export default function (commander, { dim }) {
  // i.e. `fakeit sync-gateway`
  commander
    .command('sync-gateway')
    .option('-s, --server [server]', `The server address (${dim('127.0.0.1')})`)
    .option('-b, --bucket [bucket]', `The bucket name (${dim('default')})`)
    .option('-u, --username [username]', 'the username to use (optional)')
    .option('-p, --password [password]', 'the password for the account (optional)')
    .option('-t, --timeout [timeout]', 'timeout for the servers')
    .description('This will output to a Couchbase Sync-Gateway Server')
    .action(() => {
      console.log('@fakeit/sync-gateway plugin specific logic')
    })
}
