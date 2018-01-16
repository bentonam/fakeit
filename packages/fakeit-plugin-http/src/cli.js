// this is not a function that is to be called by anything
// other than the `bin/fakeit` file in the project
export default function (commander, { dim }) {
  // i.e. `fakeit http`
  commander
    .command('http')
    .option('-s, --server [server]', `The server address (${dim('127.0.0.1')})`)
    .option('-b, --bucket [bucket]', `The bucket name (${dim('default')})`)
    .option('-u, --username [username]', 'The username to use (optional pre-5.0)')
    .option('-p, --password [password]', 'the password for the account (optional)')
    .option('-t, --timeout [timeout]', `timeout for the servers (${dim(5000)})`, Number)
    .description('Outputs the results to an HTTP(s) endpoint')
    .action(() => {
      console.log('@fakeit/http plugin specific logic')
    })
}
