var xtend = require('xtend');
var debug = require('debug')('mongo-heartbeat');
var error = require('debug')('mongo-heartbeat');
error.log = console.error.bind(console);
var cb = require('cb');

var EventEmitter = require('events').EventEmitter;

var defaults = {
  timeout: 10000,
  interval: 5000,
  tolerance: 1
};

function Pinger(db, options) {
  if (!(this instanceof Pinger)){
    return new Pinger(db, options);
  }
  EventEmitter.call(this);

  this._current_failures = 0;
  this._db = db;
  this._options = xtend(defaults, options || {});
  this._recurseCheck();
}

Pinger.prototype = Object.create(EventEmitter.prototype);

Pinger.prototype._check = function check(callback) {
  var db = this._db;
  var self = this;

  function fail (err) {
    self.stop();
    error(err.message);
    return callback(err);
  }

  var start = Date.now();
  db.command({ ping: 1 }, cb(function (err) {
    // _current_failures will restart if was healthy in previous cases
    self._current_failures = err ? (self._current_failures + 1) : 0;
    if (err) {
      var error = err;

      if (err instanceof cb.TimeoutError) {
        if (self._current_failures === 1) {
          error = new Error('the command didn\'t respond in ' + self._options.timeout + 'ms');
        } else {
          error = new Error('the command didn\'t respond in ' + self._options.timeout + 'ms after ' + self._current_failures + ' attempts');
        }
      }

      if (self._current_failures >= self._options.tolerance) {
        return fail(error);
      } else {
        self.emit('failed', error);
        return callback();
      }
    }
    self.emit('heartbeat', { delay: Date.now() - start });
    debug('heartbeat');
    return callback();
  }).timeout(this._options.timeout));
};

Pinger.prototype._recurseCheck = function () {
  var self = this;
  if (self._stop) return;
  setTimeout(function () {
    self._check(function (err) {
      if (err) {
        return self.emit('error', err);
      }
      self._recurseCheck();
    });
  }, this._options.interval);
};

Pinger.prototype.stop = function () {
  this._stop = true;
};

module.exports = Pinger;
