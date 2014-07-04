var xtend = require('xtend');
var debug = require('debug')('mongo-heartbeat');
var error = require('debug')('mongo-heartbeat');
error.log = console.error.bind(console);

var EventEmitter = require('events').EventEmitter;

var defaults = {
  timeout: 10000,
  interval: 5000,
};

function Pinger(db, options) {
  if (!(this instanceof Pinger)){
    return new Pinger(db, options);
  }
  EventEmitter.call(this);
  this._db = db;
  this._options = xtend(defaults, options || {});
  this._recurseCheck();
}

Pinger.prototype = Object.create(EventEmitter.prototype);

Pinger.prototype._check = function check(callback) {
  var db = this._db;
  var self = this;
  function fail(err) {
    self.stop = true;
    err = err || new Error('the command didn\'t respond in ' + self._options.timeout + 'ms');
    error(err.message);
    return callback(err);
  }

  var ping_check = setTimeout(fail, this._options.timeout);

  db.command({ping: 1}, function (err) {
    clearTimeout(ping_check);
    if (err) {
      return fail(err);
    }
    self.emit('heartbeat');
    debug('heartbeat');
    callback();
  });
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