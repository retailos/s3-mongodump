const FS = require('fs')
const Rimraf = require('rimraf')

const Logger = require('./logger')

module.exports = (options) => (done) => {
  Logger.debug('cleanup', options.output)

  Rimraf(`${options.output}/${options.datetime}`, (err) => {
    if (err) return done(err)

    FS.unlink(`${options.output}/${options.datetime}.tar.gz`, done)
  })
}
