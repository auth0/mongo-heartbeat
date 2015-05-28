var MongoClient = require('mongodb').MongoClient;
var expect  = require('chai').expect;
var assert  = require('chai').assert;
var Heartbeat = require('../');

describe('mongo-heartbeat', function () {
  var db;

  before(function (done) {
    MongoClient.connect('mongodb://localhost/test', function (err, $db) {
      if (err) return done(err);
      db = $db;
      done();
    });
  });

  it('should emit the heartbeat event', function (done) {
    var hb = new Heartbeat(db, {
      interval: 100
    });

    hb.on('heartbeat', function () {
      hb.stop();
      done();
    });
  });

  it('should timeout when the command doesnt respond', function (done) {
    var mockDb = {
      command: function (){}
    };
    var hb = new Heartbeat(mockDb, {
      interval: 100,
      timeout: 100
    });
    hb.on('error', function (err) {
      expect(err.message).to.equal('the command didn\'t respond in 100ms');
      done();
    });
  });

  it('should timeout when the command doesnt respond 2 pings when tolerance is 2', function (done) {
    var called_once = false;
    var called_twice = false;
    var mockDb = {
      command: function (options, callback) {
        if (called_once) {
          called_twice = true;
          return;
        }
        called_once = true;
        callback();
      }
    };
    var hb = new Heartbeat(mockDb, {
      interval: 100,
      timeout: 100,
      tolerance: 2
    });
    hb.on('error', function (err) {
      expect(hb._current_failures).to.equal(2);
      assert.ok(called_twice);
      expect(err.message).to.equal('the command didn\'t respond in 100ms after 2 attempts');
      done();
    });
  });
});