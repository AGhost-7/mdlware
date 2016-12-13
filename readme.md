# mdlware

Simple module that implements the middleware pattern.

Think of it as a mix between `EventEmitter` and `express`.

This is useful for implementing plugin systems.

## API

- `use([namespace ,]handler[,...handlers])`: Pushes a handle into the stack.
If you want a middleware that always gets executed you don't need to specify
the string.

- `handle(namespace[,...args])`: Runs a set of handlers which match the given
namespace.

- `on(event, callback)`: The middleware inherits from the `EventEmitter` prototype.
The only even available is the `error` event, which is emitted whenever an
error is caught when executing the middlewares.


## Example

```javascript
var m = middleware()

m.use(function(request, done, next) {
	if(request === 'greet') {
		done(null, 'hai')
	} else {
		next()
	}
})

m.use(function(request, done, next) {
	if(request === 'shake hand') {
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

m.handle('x', 'shake hand', function(err, res) {
	assert.equal(res, '*shakes hands*')
	assert(!err)
})

m.handle('x', 'greet', function(err, res) {
	assert.equal(res, 'hai')
	assert(!err)
})

m.handle('bleh', null, function(err, res) {
	assert(!err)
	assert.equal(res, 'BLEH YOURSELF')
})
```
