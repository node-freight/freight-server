var fs = require('fs');
var rimraf = require('rimraf');
var archiver = require('archiver');
var Promise = require('bluebird');
var Job = require('kue').Job;

module.exports = function (log) {

  var bower = require('./installers/bower')(log);
  var npm = require('./installers/npm')(log);

  function JobProcessor() {
  }

  JobProcessor.setup = function (jobs) {

    // TODO: one job at a time, npm can explode?
    // TODO: can Bower and NPM installa the same time?
    // TODO: remove jobs when errored.
    jobs.process('install', 1, function (job, done) {
      var steps = 7;
      var project = job.data.project;
      log.debug('Project Data:', project);
      log.debug('Creating Production Bundle');
      job.progress(0, steps);
      return Promise.resolve()
        // Create Production bundle
        .then(function () {
          job.progress(1, steps);
          if (project.npm) {
            job.log('Running NPM Install Production');
            return npm.install(project, { production: true });
          } else {
            return Promise.resolve();
          }
        })
        .then(function () {
          job.progress(2, steps);
          if (project.bower) {
            job.log('Running Bower Install Production');
            return bower.install(project, { production: true })
          } else {
            return Promise.resolve();
          }
        })
        .then(function () {
          job.progress(3, steps);
          return compressProject(project, project.productionBundlePath)
        })
        // Create Development bundle
        .then(function () {
          job.progress(4, steps);
          log.debug('Creating Development Bundle');
          if (project.npm) {
            return npm.install(project);
          } else {
            return Promise.resolve();
          }
        })
        .then(function () {
          job.progress(5, steps);
          if (project.bower) {
            return bower.install(project);
          } else {
            return Promise.resolve();
          }
        })
        .then(function () {
          job.progress(6, steps);
          return compressProject(project, project.bundlePath);
        })
        .then(function () {
          job.progress(7, steps);
          return cleanUp(project);
        })
        .then(
        function () {
          done();
        },
        function (err) {
          done(err);
        }
      );

    });

    // remove stale jobs
    jobs.on('job complete', function (id) {
      Job.get(id, function (err, job) {
        if (err) {
          log.error(err);
          return;
        }
        job.remove(function (err) {
          if (err) {
            log.error(err);
            throw err;
          }
          log.info('removed completed job #%d', job.id);
        });
      });
    });
  };

  function compressProject(project, path, options) {
    options = options || {};
    return new Promise(function (resolve, reject) {
      log.info('Compressing project:', project.name);
      var start = Date.now();

      var progressFilepath = path.replace('.tar.gz', '_inprogress.tar.gz');
      var output = fs.createWriteStream(path);
      var archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
          level: 6
        }
      });

      output.on('close', function () {
        fs.rename(progressFilepath, path);
        var end = Date.now();
        log.info('Bundle created:', path);
        log.info('Compression completed in ', (end - start) / 1000, 'seconds.', archive.pointer() + ' total bytes');

        resolve();
      });

      archive.on('error', function (err) {
        log.info('Archiver error', err);
        throw err;
      });

      archive.pipe(output);
      archive.bulk([
        { expand: true, cwd: project.tempPath, src: ['**'], dot: true }
      ]);
      archive.finalize();
    });
  }

  function cleanUp(project) {
    return new Promise(function (resolve, reject) {
      // TODO: need an option to keep the tempPath sometimes.
      if (true && project.tempPath && project.tempPath.length > 0) {
        rimraf(project.tempPath, function () {
          log.debug('Directory Clean:', project.tempPath);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  return JobProcessor;
};
