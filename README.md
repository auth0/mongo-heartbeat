Ping MongoDB every x seconds to prevent disconnects.

## Installation

```
npm i mongo-heartbeat
```

## Usage

```
var MongoHeartbeat = require('mongo-heartbeat');

var hb = MongoHeartbeat(db, {
  interval: 5000, //defaults to 5000 ms
  timeout: 10000, //defaults to 10000 ms
  tolerance: 2    //defaults to 1 attempt
});

hb.on('error', function (err) {
  console.error('mongodb didnt respond the heartbeat message');
  process.nextTick(function () {
    process.exit(1);
  });
});
```

## Custom Checks

By default the heartbeat will send a ping to MongoDB, but you can override this with your own logic (eg: query a collection). It would be advisable to run a query/command which has a low impact on your database (like querying a collection with a few records for example).

```
var MongoHeartbeat = require('mongo-heartbeat');

var hb = MongoHeartbeat(db, {
  interval: 5000,
  timeout: 10000,
  tolerance: 2,,
  checkHandler: function(database, cb) {
    database.collection('someCollectionWithFewRecords').find({ }, cb);
  }
});

hb.on('error', function (err) {
  console.error('mongodb didnt respond the heartbeat message or the check failed', err);
  process.nextTick(function () {
    process.exit(1);
  });
});
```

## Debug

This module uses the [debug](https://github.com/visionmedia/debug) module, use as follows:

DEBUG=mongo-heartbeat node server

## Testing

Use `npm run test` to run the unit tests (make sure MongoDB is running on `mongodb://localhost/test`).

## License

MIT 2014 - Auth0 Inc.
