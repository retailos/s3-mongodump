const { basename } = require('path')
const S3 = require('s3')

const Logger = require('./logger')

const getS3Options = (options) => ({
  uploaderOptions: {
    localFile: `${options.output}/${options.datetime}.tar.gz`,
    s3Params: {
      Bucket: options.bucket,
      Key: basename(`${options.output}/${options.datetime}.tar.gz`),
      ACL: 'private'
    }
  },
  clientOptions: {
    s3RetryCount: options.retry || 3,
    s3Options: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: 'eu-west-1'
    }
  }
})

module.exports = (options) => (done) => {
  Logger.debug('sendToS3', { bucket: options.bucket })

  const { clientOptions, uploaderOptions } = getS3Options(options)
  const client = S3.createClient(clientOptions)
  const uploader = client.uploadFile(uploaderOptions)

  uploader.on('error', done)
  uploader.on('progress', () => {
    const { progressMd5Amount, progressAmount, progressTotal } = uploader
    Logger.debug('progress', progressMd5Amount, progressAmount, progressTotal)
  })

  uploader.on('end', (data) => {
    Logger.debug('sendToS3', { data })
    done()
  })
}
