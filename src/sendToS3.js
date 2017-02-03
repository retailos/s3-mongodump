const S3 = require('s3')
const Logger = require('./logger')

const getS3Options = (options) => ({
  Bucket: options.bucket,
  Key: `${options.output}.tar.gz`,
  ACL: 'private',
  s3Options: {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey
  }
})

module.exports = (options) => (done) => {
  Logger.debug('sendToS3', { bucket: options.bucket })

  const s3Options = getS3Options(options)
  const uploader = S3.createClient(s3Options)

  uploader.on('error', done)
  uploader.on('progress', () => {
    const { progressMd5Amount, progressAmount, progressTotal } = uploader
    Logger.debug('progress', progressMd5Amount, progressAmount, progressTotal)
  })

  uploader.on('end', done)
}
