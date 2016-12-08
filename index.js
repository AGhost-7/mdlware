
var events = require('events')

var EventEmitter = typeof events === 'function' ? events : events.EventEmitter
var util = require('util')
var timers = require('timers')

function Dispatcher() {
	this._stack = []
	EventEmitter.call(this)
}

Dispatcher.prototype = Object.create(null)

util.inherits(Dispatcher, EventEmitter)

var proto = Dispatcher.prototype

proto.handle = function(namespace) {
	var stack = this._stack
	var args = Array.prototype.slice.call(arguments, 1)
	var i = 0
	var self = this

	var process = function() {
		for(; i < stack.length; i++) {
			var item = stack[i]
			if(item.namespace === null || item.namespace === namespace) {
				try {
					item.handler.apply(null, args.concat(next))
				} catch(err) {
					self.emit('error', err, args)
				}
				i++
				break
			}
		}
	}

	var next = function(err) {
		timers.setImmediate(process)
	}

	next()
}

function DispatcherItem(namespace, handler) {
	this.namespace = namespace
	this.handler = handler
}

proto.use = function() {
	if(arguments.length === 1) {
		this._stack.push(new DispatcherItem(null, arguments[0]))
	} else {
		this._stack.push(new DispatcherItem(arguments[0], arguments[1]))
	}
}


module.exports = function() {
	return new Dispatcher()
}
