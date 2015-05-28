Ping mongodb every x seconds to prevent disconnections.

## Installation

```
npm i mongo-heartbeat
```

## Usage

```

var MongoHeartbeat = require('mongo-heartbeat');

var hb = MongoHeartbeat(db, {
  interval: 5000, //defaults to 5000 ms,
  timeout: 10000  //defaults to 10000 ms
  tolerance: 2    //defaults to 1 attempt
});

hb.on('error', function (err) {
  console.error('mongodb didnt respond the heartbeat message');
  process.nextTick(function () {
    process.exit(1);
  });
});
```

## Debug

This module uses the [debug](https://github.com/visionmedia/debug) module, use as follows:

DEBUG=mongo-heartbeat node server

## License

MIT 2014 - Auth0 Inc.