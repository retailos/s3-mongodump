const { EventEmitter } = require('events')
const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

let ClientStub = {}
let S3Stub = {}
const SendToS3 = Proxyquire('../src/sendToS3', {
  's3': S3Stub
})

const { beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/sendToS3', () => {
  let emitter, options

  beforeEach((done) => {
    emitter = new EventEmitter()
    ClientStub.uploadFile = Sinon.stub().returns(emitter)
    S3Stub.createClient = Sinon.stub().returns(ClientStub)
    options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      bucket: 'bucket',
      output: process.cwd()
    }

    done()
  })

  it('builds s3 options', (done) => {
    const uploaderOptions = {
      localFile: `${process.cwd()}.tar.gz`,
      s3Params: {
        Bucket: 'bucket',
        Key: 's3-mongodump.tar.gz',
        ACL: 'private'
      }
    }

    const s3Options = {
      s3RetryCount: 3,
      s3Options: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey'
      }
    }

    SendToS3(options)(() => {
      expect(S3Stub.createClient.calledWith(s3Options)).to.be.true()
      expect(ClientStub.uploadFile.calledWith(uploaderOptions)).to.be.true()
      done()
    })

    emitter.emit('end')
  })

  it('uses options.retry if supplied', (done) => {
    options.retry = 10
    const uploaderOptions = {
      localFile: `${process.cwd()}.tar.gz`,
      s3Params: {
        Bucket: 'bucket',
        Key: 's3-mongodump.tar.gz',
        ACL: 'private'
      }
    }

    const s3Options = {
      s3RetryCount: 10,
      s3Options: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey'
      }
    }

    SendToS3(options)(() => {
      expect(S3Stub.createClient.calledWith(s3Options)).to.be.true()
      expect(ClientStub.uploadFile.calledWith(uploaderOptions)).to.be.true()
      done()
    })

    emitter.emit('end')
  })

  it('has a handler for progress emission', (done) => {
    SendToS3(options)(done)
    emitter.emit('progress')
    emitter.emit('end')
  })

  it('yields an error when emitted', (done) => {
    const errMessage = new Error('emitter error')
    SendToS3(options)((err) => {
      expect(err).to.equal(err)
      done()
    })

    emitter.emit('error', errMessage)
  })
})
