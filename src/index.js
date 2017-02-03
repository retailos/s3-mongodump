const Waterfall = require('run-waterfall')

const Backup = require('./backup')
const Tar = require('./tar')
const SendToS3 = require('./sendToS3')

const isInvalidOptions = (options) => {
  if (!options.host) return new Error('options.host is required')
  if (!options.username) return new Error('options.username is required')
  if (!options.password) return new Error('options.password is required')
  if (!options.output) return new Error('options.output is required')
  if (!options.bucket) return new Error('options.bucket is required')
  if (!options.accessKeyId) return new Error('options.accessKeyId is required')
  if (!options.secretAccessKey) return new Error('options.secretAccessKey is required')
  return false
}

module.exports = (options, done) => {
  const isInvalid = isInvalidOptions(options)
  if (isInvalid) return done(isInvalid)

  const operations = [Backup(options), Tar(options), SendToS3(options)]
  Waterfall(operations, done)
}
