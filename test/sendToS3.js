const { EventEmitter } = require('events')
const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

let SpawnStub = {}
const SendToS3 = Proxyquire('../src/sendToS3', {
  's3': SpawnStub
})

const { beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/sendToS3', () => {
  let emitter, options

  beforeEach((done) => {
    emitter = new EventEmitter()
    SpawnStub.createClient = Sinon.stub().returns(emitter)
    options = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      bucket: 'bucket',
      output: process.cwd()
    }

    done()
  })

  it('builds s3 options', (done) => {
    const s3Options = {
      Bucket: 'bucket',
      Key: `${process.cwd()}.tar.gz`,
      ACL: 'private',
      s3Options: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey'
      }
    }

    SendToS3(options)(() => {
      expect(SpawnStub.createClient.calledWith(s3Options)).to.be.true()
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
