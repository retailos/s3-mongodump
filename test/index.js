const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

const BackupStub = Sinon.stub()
const SendToS3Stub = Sinon.stub()
const TarStub = Sinon.stub()
const Backup = Proxyquire('../src', {
  './backup': Sinon.stub().returns(BackupStub),
  './tar': Sinon.stub().returns(TarStub),
  './sendToS3': Sinon.stub().returns(SendToS3Stub)
})

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/index', () => {
  let options

  beforeEach((done) => {
    options = {
      host: 'mongodb://localhost:27017',
      username: 'username',
      password: 'password',
      output: process.cwd(),
      bucket: 'bucket',
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    }

    BackupStub.yields()
    SendToS3Stub.yields()
    TarStub.yields()
    done()
  })

  afterEach((done) => {
    BackupStub.reset()
    SendToS3Stub.reset()
    TarStub.reset()
    done()
  })

  it('yields error when no options.host', (done) => {
    delete options.host
    Backup(options, (err) => {
      expect(err.message).to.equal('options.host is required')
      done()
    })
  })

  it('yields error when no options.username', (done) => {
    delete options.username
    Backup(options, (err) => {
      expect(err.message).to.equal('options.username is required')
      done()
    })
  })

  it('yields error when no options.password', (done) => {
    delete options.password
    Backup(options, (err) => {
      expect(err.message).to.equal('options.password is required')
      done()
    })
  })

  it('yields error when no options.output', (done) => {
    delete options.output
    Backup(options, (err) => {
      expect(err.message).to.equal('options.output is required')
      done()
    })
  })

  it('yields error when no options.bucket', (done) => {
    delete options.bucket
    Backup(options, (err) => {
      expect(err.message).to.equal('options.bucket is required')
      done()
    })
  })

  it('yields error when no options.accessKeyId', (done) => {
    delete options.accessKeyId
    Backup(options, (err) => {
      expect(err.message).to.equal('options.accessKeyId is required')
      done()
    })
  })

  it('yields error when no options.secretAccessKey', (done) => {
    delete options.secretAccessKey
    Backup(options, (err) => {
      expect(err.message).to.equal('options.secretAccessKey is required')
      done()
    })
  })

  describe('backup fails', () => {
    beforeEach((done) => {
      BackupStub.yields(new Error('backup error'))
      done()
    })

    it('yields the error', (done) => {
      Backup(options, (err) => {
        expect(err.message).to.equal('backup error')
        done()
      })
    })

    it('runs backup', (done) => {
      Backup(options, () => {
        expect(BackupStub.called).to.be.true()
        done()
      })
    })

    it('does not run tar', (done) => {
      Backup(options, () => {
        expect(TarStub.called).to.be.false()
        done()
      })
    })

    it('does not run sendToS3', (done) => {
      Backup(options, () => {
        expect(SendToS3Stub.called).to.be.false()
        done()
      })
    })
  })

  describe('tar fails', () => {
    beforeEach((done) => {
      TarStub.yields(new Error('tar error'))
      done()
    })

    it('yields the error', (done) => {
      Backup(options, (err) => {
        expect(err.message).to.equal('tar error')
        done()
      })
    })

    it('runs backup', (done) => {
      Backup(options, () => {
        expect(BackupStub.called).to.be.true()
        done()
      })
    })

    it('runs tar', (done) => {
      Backup(options, () => {
        expect(TarStub.called).to.be.true()
        done()
      })
    })

    it('does not run sendToS3', (done) => {
      Backup(options, () => {
        expect(SendToS3Stub.called).to.be.false()
        done()
      })
    })
  })

  describe('sendToS3 fails', () => {
    beforeEach((done) => {
      SendToS3Stub.yields(new Error('sendToS3 error'))
      done()
    })

    it('yields the error', (done) => {
      Backup(options, (err) => {
        expect(err.message).to.equal('sendToS3 error')
        done()
      })
    })

    it('runs backup', (done) => {
      Backup(options, () => {
        expect(BackupStub.called).to.be.true()
        done()
      })
    })

    it('runs tar', (done) => {
      Backup(options, () => {
        expect(TarStub.called).to.be.true()
        done()
      })
    })

    it('runs sendToS3', (done) => {
      Backup(options, () => {
        expect(SendToS3Stub.called).to.be.true()
        done()
      })
    })
  })
})
