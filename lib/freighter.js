var async = require('async');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var kue = require('kue');
var mkdirp = require('mkdirp');

var processor = require('./job_processor')();

module.exports = function (conf) {

  var jobs = kue.createQueue({
    redis: conf.get('redis')
  });

  processor.setup(jobs);

  function Freighter() {
  }

  Freighter.create = function (project, extra) {

    //TODO: refactor
    mkdirp(project.tempPath, function (err) {
      if (err) console.error(err);

      var installJob = jobs.create('install', {
        npmInstall: project.npmInstall,
        bower: project.bower,
        bowerrc: project.bowerrc,
        storageDir: project.storageDir,
        bundlePath: project.bundlePath,
        tempPath: project.tempPath,
        title: project.name
      }).priority(extra.priority)
        .save();

      installJob.on('promotion', function () {
        console.log('renewal job promoted');
      });

      installJob.on('complete', function () {
        console.log('renewal job completed');
      });
    });


  };

  return Freighter;
};
