const Exec = require('child_process')
const Logger = require('./logger')

const getBackupArgs = (options) => {
  const args = [
    '--host', options.host,
    '--username', options.username,
    '--password', options.password,
    '-o', `${options.output}/${options.datetime}`
  ]

  if (options.oplog) args.push('--oplog')
  return args
}

module.exports = (options) => (done) => {
  Logger.debug('backup', options.host, `${options.output}/${options.datetime}`)

  const backupArgs = getBackupArgs(options)
  const command = Exec.spawn('mongodump', backupArgs, { stdio: 'inherit' })

  command.on('error', done)
  command.on('close', (code) => {
    if (code !== 0) return done(new Error('Backup failed'))

    done()
  })
}
