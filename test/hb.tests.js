var MongoClient = require('mongodb').MongoClient;
var expect  = require('chai').expect;
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
});