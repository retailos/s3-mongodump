const { EventEmitter } = require('events')
const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

let SpawnStub = {}
const Backup = Proxyquire('../src/backup', {
  'child_process': SpawnStub
})

const { beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/backup', () => {
  let datetime, emitter, options

  beforeEach((done) => {
    datetime = new Date()
    emitter = new EventEmitter()
    SpawnStub.spawn = Sinon.stub().returns(emitter)
    options = {
      host: 'mongodb://localhost:27017',
      username: 'username',
      password: 'password',
      output: process.cwd(),
      datetime
    }

    done()
  })

  it('builds backup arguments', (done) => {
    const backupArgs = [
      '--host', 'mongodb://localhost:27017',
      '--username', 'username',
      '--password', 'password',
      '-o', `${process.cwd()}/${datetime}`
    ]

    Backup(options)(() => {
      expect(SpawnStub.spawn.calledWith('mongodump', backupArgs)).to.be.true()
      done()
    })

    emitter.emit('close', 0)
  })

  it('adds oplog arg if present in options', (done) => {
    const backupArgs = [
      '--host', 'mongodb://localhost:27017',
      '--username', 'username',
      '--password', 'password',
      '-o', `${process.cwd()}/${datetime}`,
      '--oplog'
    ]

    options.oplog = true
    Backup(options)(() => {
      expect(SpawnStub.spawn.calledWith('mongodump', backupArgs)).to.be.true()
      done()
    })

    emitter.emit('close', 0)
  })

  it('yields an error when emitted', (done) => {
    const errMessage = new Error('emitter error')
    Backup(options)((err) => {
      expect(err).to.equal(err)
      done()
    })

    emitter.emit('error', errMessage)
  })

  it('yields an error on non zero exit code', (done) => {
    Backup(options)((err) => {
      expect(err.message).to.equal('Backup failed')
      done()
    })

    emitter.emit('close', 1)
  })
})
