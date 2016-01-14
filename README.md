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

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
