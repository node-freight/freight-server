'use strict';

var exec = require('child_process').exec;

exports['cli'] = {
  'freight': function (test) {
    test.expect(1);

    exec('freight',
      function (error, stdout, stderr) {
        test.ok(stderr);
        test.done();
      });
  },
  'freight -u': function (test) {
    test.expect(1);

    exec('freight -u=http://localhost:8872',
      function (error, stdout, stderr) {
        test.equal(stderr, '');
        test.done();
      });
  },
  'freight FREIGHT_URL': function (test) {
    test.expect(1);

    process.env.FREIGHT_URL = 'http://localhost:8872';
    exec('freight',
      function (error, stdout, stderr) {
        test.equal(stderr, '');
        test.done();
      });
    process.env.FREIGHT_URL = null;
  },
  'freight -u=http://localhost:8872 --silent': function (test) {
    test.expect(2);
    exec('freight -u=http://localhost:8872 --silent',
      function (error, stdout, stderr) {
        test.equal(stderr, '');
        test.equal(stdout, '');
        test.done();
    });
  },
  'freight -u=http://localhost:8872 -h': function (test) {
    test.expect(2);

    exec('freight -u=http://localhost:8872 -h',
      function (error, stdout, stderr) {
        test.equal(stderr, '');
        test.equal(stdout.substring(0,15), '\n--help\n -h Dis');
        test.done();
      });
  },
  'freight -u=http://localhost:8872 --verbose': function (test) {
    test.expect(2);

    exec('freight -u=http://localhost:8872 --verbose',
      function (error, stdout, stderr) {
        test.equal(stderr, '');
        test.equal(stdout.substring(0,15), 'Detecting Envir');
        test.done();
      });
  }
};
