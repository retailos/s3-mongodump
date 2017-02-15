const { expect } = require('code')
const Lab = require('lab')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

const rimrafStub = Sinon.stub()
const unlinkStub = Sinon.stub()
const Cleanup = Proxyquire('../src/cleanup', {
  fs: { unlink: unlinkStub },
  rimraf: rimrafStub
})
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script()

describe('src/cleanup', () => {
  let datetime, options

  beforeEach((done) => {
    datetime = new Date()
    options = { output: process.cwd(), datetime }
    rimrafStub.yields()
    unlinkStub.yields()
    done()
  })

  afterEach((done) => {
    rimrafStub.reset()
    unlinkStub.reset()
    done()
  })

  describe('fs.rmdir fails to remove directory', () => {
    beforeEach((done) => {
      rimrafStub.yields(new Error('fs.rmdir error'))
      done()
    })

    it('yields an error when removing options.output', (done) => {
      Cleanup(options)((err) => {
        expect(err.message).to.equal('fs.rmdir error')
        expect(unlinkStub.called).to.be.false()
        done()
      })
    })
  })

  describe('fs.unlink fails to remove tar file', () => {
    beforeEach((done) => {
      unlinkStub.yields(new Error('fs.unlink error'))
      done()
    })

    it('yields an error removing tar file', (done) => {
      Cleanup(options)((err) => {
        expect(err.message).to.equal('fs.unlink error')
        done()
      })
    })
  })

  it('removes option.output dir and tar file', (done) => {
    Cleanup(options)((err) => {
      expect(err).to.not.exist()
      expect(rimrafStub.calledWith(`${options.output}/${datetime}`)).to.be.true()
      expect(unlinkStub.calledWith(`${options.output}/${datetime}.tar.gz`)).to.be.true()
      done()
    })
  })
})
