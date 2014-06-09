var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var freight = require('freight')();

module.exports = function (log, conf) {
  function Tracker() {
  }

  Tracker.create = function (repository, callback) {

    return fetchRepository(repository)
      .then(function (projectDirectory) {
        var options = {
          // TODO: http(s)
          url: 'http://' + 'localhost' + ':' + conf.get('port') + '/',
          action: 'create',
          password: conf.get('password'),
          directory: projectDirectory,
          verbose: true
        };
        return freight.init(options);
      })
      .then(
        callback,
        function (err) {
          callback(err);
        }
      );
  };

  function fetchRepository(repository) {
    return new Promise(function (resolve, reject) {
      var cloneDir = conf.get('tempDir') + '/clone' + Date.now();
      var cmd = 'git';
      var args = ['clone', repository, '--depth=1', cloneDir];
      var gitClone = spawn(cmd, args, { cwd: process.cwd() });

      gitClone.stdout.on('data', function (data) {
        if (data) {
          log.debug(data.toString());
        }
      });

      gitClone.stderr.on('data', function (data) {
        if (data) {
          log.debug(data.toString());
        }
      });

      gitClone.on('close', function (code) {
        if (code === 0) {
          resolve(cloneDir);
        } else {
          reject();
        }
      });
    });
  }

  return Tracker;
};
