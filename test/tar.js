const { EventEmitter } = require('events')
const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

let SpawnStub = {}
const Tar = Proxyquire('../src/tar', {
  'child_process': SpawnStub
})

const { beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/tar', () => {
  let datetime, emitter, options

  beforeEach((done) => {
    datetime = new Date()
    emitter = new EventEmitter()
    SpawnStub.spawn = Sinon.stub().returns(emitter)
    options = { output: process.cwd(), datetime }

    done()
  })

  it('builds tar arguments', (done) => {
    const tarArgs = [
      '-czvf',
      `${process.cwd()}/${datetime}.tar.gz`,
      `${process.cwd()}/${datetime}`
    ]

    Tar(options)(() => {
      expect(SpawnStub.spawn.calledWith('tar', tarArgs)).to.be.true()
      done()
    })

    emitter.emit('close', 0)
  })

  it('yields an error when emitted', (done) => {
    const errMessage = new Error('emitter error')
    Tar(options)((err) => {
      expect(err).to.equal(err)
      done()
    })

    emitter.emit('error', errMessage)
  })

  it('yields an error on non zero exit code', (done) => {
    Tar(options)((err) => {
      expect(err.message).to.equal('Tar directory failed')
      done()
    })

    emitter.emit('close', 1)
  })
})
