// @flow

import chalk from 'chalk'

export default function (config: Object): void {
  config.cli((caporal: Object): void => {
    caporal
      .command('couchbase')
      .option('-s, --server [server]', `The server address (${chalk.dim('127.0.0.1')})`)
      .option('-b, --bucket [bucket]', `The bucket name (${chalk.dim('default')})`)
      .option('-u, --username [username]', 'The username to use (optional pre-5.0)')
      .option('-p, --password [password]', 'the password for the account (optional)')
      .option('-t, --timeout [timeout]', `timeout for the servers (${chalk.dim(5000)})`, Number)
      .option(
        '-r, --use-streams [useStreams]',
        `${chalk.red('**experimental**')}
            Whether or not to use node streams. Used for high output
            documents and can only be used when there are no dependencies (${chalk.dim(false)})`,
        Boolean,
      )
      .option(
        '-w, --high-water-mark [highWaterMark]',
        `${chalk.red('**experimental**')}
                                          The # of objects to process through the stream at a time (${chalk.dim(16)})`,
        Number,
      )
      .description('This will output to a Couchbase Server')
      .action(() => {
        console.log('@fakeit/couchbase plugin specific logic')
      })
  })
}
