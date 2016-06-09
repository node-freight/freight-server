var spawn = require('cross-spawn-async');
var path = require('path');

var Promise = require('bluebird');
var rimraf = require('rimraf');
var freight = require('freight')();

module.exports = function (log, conf, jobs) {

  function fetchRepository(repository, branch) {
    return new Promise(function (resolve, reject) {
      var cloneDir = path.join(conf.get('tempDir'), 'clone' + Date.now());
      var cmd = 'git';
      var args = ['clone', repository, '-b', branch, '--depth=1', cloneDir];
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
  
  function Tracker() {
  }

  jobs.process('check_repository', 1, function (job, done) {
    var repository = job.data.repository;
    var branch = job.data.branch;
    var extraOptions = job.data.extraOptions || {};

    log.debug('Tracker: Fetching repository:', repository, 'Branch:', branch);
    return fetchRepository(repository, branch)
      .then(function (projectDirectory) {
        log.debug('Tracker: Got project directory', projectDirectory);
        var options = {
          // TODO: http(s)
          url: 'http://' + conf.get('ip') + ':' + conf.get('port') + '/',
          action: 'create',
          server: true,
          log: log,
          directory: projectDirectory,
          verbose: true
        };

        if (extraOptions.trackDirectory) {
          options.directory = path.join(projectDirectory, extraOptions.trackDirectory);
        }

        return freight.init(options)
          .then(
            function () {
              log.debug('Tracker: Freight done.');
              return new Promise(function (resolve, reject) {
                rimraf(projectDirectory, function (err) {
                  if (err) {
                    return reject(err);
                  }
                  log.debug('Tracker: Directory Clean:', projectDirectory);
                  return resolve();
                });
              });
            }
          );
      })
      .then(
        function() {
          log.debug('Tracker: Scheduling another check_repository.');
          jobs.create('check_repository', {
            title: repository + '_' + branch,
            repository: repository,
            branch: branch,
            extraOptions: extraOptions
          })
            .delay(conf.get('track').delay)
            .save();

          done();
        },
        function (err) {
          log.error('Tracker failed.');
          log.error(err);
          done(err);
        }
      );

  });

  Tracker.create = function (repository, branch, extraOptions, callback) {
    log.debug('Calling create');
    var job = jobs.create('check_repository', {
      title: repository + '_' + branch,
      repository: repository,
      branch: branch,
      extraOptions: extraOptions
    }).save();

    job.on('complete', function(){
      log.info('Job completed');
      callback(null);
    }).on('failed', function(){
      callback(new Error('Create failed'));
    })
  };

  return Tracker;
};
