var mkdirp = require('mkdirp');

module.exports = function (log, conf, jobs) {
  function Freighter() {
  }

  Freighter.create = function (project, extra) {

    //TODO: refactor
    mkdirp(project.tempPath, function (err) {
      if (err) {
        log.error(err);
      }

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
