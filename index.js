var xtend = require('xtend');
var debug = require('debug')('mongo-heartbeat');
var error = require('debug')('mongo-heartbeat');
error.log = console.error.bind(console);
var cb = require('cb');

var EventEmitter = require('events').EventEmitter;

var defaults = {
  timeout: 10000,
  interval: 5000,
  tolerance: 1,
  checkHandler: function(db, callback) {
    db.command({ping: 1}, callback);
  }
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

  self._options.checkHandler(db, cb(function (err) {
    self._current_failures = err ? (self._current_failures + 1) : 0;
    if (err && self._current_failures >= self._options.tolerance) {
      var error = err;

      if (err instanceof cb.TimeoutError) {
        if (self._current_failures === 1) {
          error = new Error('the command didn\'t respond in ' + self._options.timeout + 'ms');
        } else {
          error = new Error('the command didn\'t respond in ' + self._options.timeout + 'ms after ' + self._current_failures + ' attempts');
        }
      }

      return fail(error);
    }
    self.emit('heartbeat');
    debug('heartbeat');
    callback();
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
