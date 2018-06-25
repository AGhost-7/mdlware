var middleware = require('..')
var assert = require('assert')

describe('middleware', function() {
  describe('basics', function() {
    var middle = middleware()

    middle.use(function(args, next) {
      if (args.level === 1) {
        args.msg = 'level 1'
      } else if (args.level > 9000) {
        throw new Error()
      } else {
        next()
      }
    })

    middle.use('example', function(args, next) {
      if (args.level === 2) {
        args.msg = 'level 2'
      }
    })

    middle.use(
      'example2',
      function(args, next) {
        next()
      },
      function(args, next) {
        args.two = true
      }
    )

    it('should handle simple results', function(done) {
      var args = { level: 1 }
      middle.handle('example', args)
      setTimeout(function() {
        assert.equal(args.msg, 'level 1')
        done()
      }, 500)
    })

    it('should emit thrown errors', function(done) {
      middle.once('error', function(err) {
        assert(err)
        done()
      })
      middle.handle('example', { level: 9001 })
    })

    it('should reach the end', function(done) {
      var args = { level: 2 }
      middle.handle('example', args)
      setTimeout(function() {
        assert.equal(args.msg, 'level 2')
        done()
      }, 1000)
    })

    it('should not run items that dont match', function(done) {
      var args = { level: 2 }
      setTimeout(function() {
        assert(args.msg !== 'level 2')
        done()
      }, 500)
      middle.handle('foobar', args)
    })

    it('should execute multi handlers', function(done) {
      var args = {}
      setTimeout(function() {
        assert(args.two)
        done()
      }, 500)
      middle.handle('example2', args)
    })
  })

  describe('a use case with a "complete" callback', function() {
    var m = middleware()

    m.use(function(request, done, next) {
      if (request === 'greet') {
        done(null, 'hai')
      } else {
        next()
      }
    })

    m.use(function(request, done, next) {
      if (request === 'shake hand') {
        done(null, '*shakes hands*')
      } else {
        next()
      }
    })

    m.use('bleh', function(request, done) {
      done(null, 'BLEH YOURSELF')
    })

    m.use(function(request, done) {
      done(new Error('unhandled'))
    })

    it('should run the first resulting middlware', function(done) {
      m.handle('x', 'greet', function(err, res) {
        assert.equal(res, 'hai')
        assert(!err)
        done()
      })
    })

    it('should run the second middleware', function(done) {
      m.handle('x', 'shake hand', function(err, res) {
        assert.equal(res, '*shakes hands*')
        assert(!err)
        done()
      })
    })

    it('should return errors', function(done) {
      m.handle('x', 'x', function(err) {
        assert(err)
        done()
      })
    })

    it('should run matching middlewares', function(done) {
      m.handle('bleh', 'bleh', function(err, res) {
        assert(!err)
        assert.equal(res, 'BLEH YOURSELF')
        done()
      })
    })
  })
})
