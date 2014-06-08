var kue = require('kue');
var mkdirp = require('mkdirp');

module.exports = function (log, conf) {
  var processor = require('./job_processor')(log);

  log.debug('Redis Configuration', conf.get('redis'));
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

      var installJob = jobs.create('install', { project: project, title: project.name })
        .priority(extra.priority)
        .save();

      installJob.on('promotion', function () {
        log.debug('Kue Job Promoted');
      });

      installJob.on('complete', function () {
        log.debug('Kue Job Promoted');
      });
    });
  };

  return Freighter;
};
