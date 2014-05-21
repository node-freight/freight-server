var fs = require('fs');
var async = require('async');
var npmi = require('npmi');
var path = require('path');
var rimraf = require('rimraf');
var kue = require('kue');

module.exports = function (log) {

  function JobProcessor() {}

  JobProcessor.setup = function(jobs) {

    // TODO: one job at a time, npm can explode?
    // TODO: can Bower and NPM installa the same time?
    // TODO: remove jobs when errored.
    jobs.process('install', 1, function (job, done) {
      var project = job.data;
      log.debug('Job Data:', project);
      /*
        job.data.
       npmInstall: project.npmInstall,
       bowerInstall: project.bowerInstall,
       storageDir: project.storageDir,
       bundlePath: project.bundlePath,
       tempPath: project.tempPath,
       title: project.name
       */

      async.eachLimit(project.npmInstall, 20,
      //async.eachLimit([], 20,
        function (item, next) {
          log.debug('NPM Install:', item);
          // TODO: skip npm here?
          npmInstall(project.tempPath, item, next);
        },
        function (err) {
          // results is now an array of stats for each file
          if (err) throw err;
          console.log('done...');

          if (project.bower) {
            bowerInstall(project, function() {
              compressProject(project, function() {
                done();
              });
            });
          } else {
            compressProject(project, function() {
              done();
            });
          }

        });
    });

    // remove stale jobs
    /*
    jobs.on('job complete', function (id) {
      console.log('job complete');
      Job.get(id, function (err, job) {
        if (err) return;
        job.remove(function (err) {
          if (err) throw err;
          console.log('removed completed job #%d', job.id);
        });
      });
    });*/
  };

  function bowerInstall(project, next) {
    // TODO: quick hacks below, this might be fixed one day...
    // TODO: custom via .rc
    // TODO: need to refactor using bower.commands but resolver gets confused.
    var spawn = require('child_process').spawn;
    var bowerJson = JSON.stringify({
      dependencies: project.bower.dependencies,
      devDependencies: project.bower.devDependencies,
      name: project.title
    }, null, 4);

    var bowerrc = JSON.stringify({
      // TODO: proper bower directory, refactor
      "directory": "bower_components"
    });

    if (project.bowerrc) {
      bowerrc = JSON.stringify(project.bowerrc);
    }

    // TODO: ugghh
    fs.writeFileSync(project.tempPath + '/bower.json', bowerJson);
    fs.writeFileSync(project.tempPath + '/.bowerrc', bowerrc);
    var bowerCli = spawn(
      // TODO: fix windows and proper path
      __dirname + '/../node_modules/.bin/bower',
      ['install'],
      { cwd: project.tempPath }
    );

    bowerCli.stdout.on('data', function (data) {
      if (data) {
        console.log(data.toString());
      }
    });

    bowerCli.stderr.on('data', function (data) {
      if (data) {
        console.log(data.toString());
      }
    });

    bowerCli.on('close', function (code) {
      console.log('Bower install complete');
      fs.unlinkSync(project.tempPath + '/bower.json', bowerJson);
      fs.unlinkSync(project.tempPath + '/.bowerrc', bowerrc);
      next();
    });

  }

  function npmInstall(hashPath, item, next) {
    var options = {
      name: item.name, // NPM Module ame
      version: item.version, // Expected version [default: 'latest']
      path: hashPath, // Installation path [default: '.']
      forceInstall: false, // Force install if set to true (even if already installed, it will do a reinstall)
      npmLoad: { // npm.load(options, callback): this is the "options" given to npm.load()
        //loglevel: 'silent'  // [default: {loglevel: 'silent'}]
      }
    };

    npmi(options, function (err, result) {
      if (err) {
        if (err.code === npmi.LOAD_ERR) {
          log.error('NPM Load Error');
          log.error(err);
        }
        else if (err.code === npmi.INSTALL_ERR) {
          log.error('NPM Install Error');
          log.error(err);
        } else {
          log.fatal('Fatal NPM Install Error');
          log.fatal(err);
        }
      }

      next();
    });
  }

  function compressProject(project, next) {
    log.info('Compressing project');
    var start = Date.now();

    var archiver = require('archiver');

    var output = fs.createWriteStream(project.bundlePath);
    var archive = archiver('tar', {
      gzip: true,
      gzipOptions: {
        level: 1
      }
    });

    output.on('close', function() {
      var end = Date.now();
      log.info('Compression completed in ', (end - start) / 1000, 'seconds.', archive.pointer() + ' total bytes');

      if (true && project.tempPath && project.tempPath.length > 0) {
        rimraf(project.tempPath, function () {
          console.log('Directory clean!');
          next();
        });
      } else {
        next();
      }
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(output);

    archive.bulk([
      { expand: true, cwd: project.tempPath, src: ['**'] }
    ]);

    archive.finalize();

  }

  return JobProcessor;
};
