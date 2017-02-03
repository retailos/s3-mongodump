const Exec = require('./exec')
const Logger = require('./logger')

const getTarArgs = (options) => [
  '-czvf',
  `${options.output}.tar.gz`,
  options.output
]

module.exports = (options) => (done) => {
  Logger.debug('tar', options.output)

  const tarArgs = getTarArgs(options)
  const command = Exec.spawn('tar', tarArgs, { stdio: 'inherit' })

  command.on('error', done)
  command.on('close', (code) => {
    if (code !== 0) return done(new Error('Tar directory failed'))
    done()
  })
}
