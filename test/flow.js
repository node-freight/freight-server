'use strict';

var exec = require('child_process').exec;
var fs = require('fs');

exports['flow'] = {
  'basic npm only': function (test) {
    test.expect(5);

    var cwd = process.cwd();
    process.chdir('fixtures/project1');

    exec('freight -u=http://localhost:8872 -c -p=vlad',
      function (error, stdout, stderr) {
        //console.log(error, stdout, stderr);
        test.assert(stdout);

        exec('freight -u=http://localhost:8872 -v',
          function (error, stdout, stderr) {
            //console.log(error, stdout, stderr);

            test.assert(fs.existsSync('node_modules'));
            test.assert(fs.existsSync('node_modules/inherits'));
            test.assert(fs.existsSync('node_modules/rimraf'));
            test.assert(!fs.existsSync('bower_components'));
            process.chdir(cwd);
            test.done();
          });
      });
  },
  'basic both': function (test) {
    test.expect(4);

    var cwd = process.cwd();
    process.chdir('fixtures/project2');

    exec('freight -u=http://localhost:8872 -c -p=vlad',
      function (error, stdout, stderr) {
        console.log(error, stdout, stderr);

        exec('freight -u=http://localhost:8872 -v',
          function (error, stdout, stderr) {
            console.log(error, stdout, stderr);

            test.assert(fs.existsSync('node_modules'));
            test.assert(fs.existsSync('node_modules/inherits'));
            test.assert(fs.existsSync('node_modules/rimraf'));
            test.assert(fs.existsSync('bower_components'));
            test.done();
            process.chdir(cwd);
          });
      });
  }
};
