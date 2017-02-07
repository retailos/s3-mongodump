const FS = require('fs')

const Logger = require('./logger')

module.exports = (options) => (done) => {
  Logger.debug('cleanup', options.output)

  FS.rmdir(options.output, (err) => {
    if (err) return done(err)

    FS.unlink(`${options.output}.tar.gz`, done)
  })
}
