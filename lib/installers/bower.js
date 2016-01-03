var fs = require('fs');
var spawn = require('cross-spawn-async');
var path = require('path');
var Promise = require('bluebird');

module.exports = function(log) {

  var install = function (project, options) {
    options = options || {};
    return new Promise(function(resolve, reject){

      var bowerJson = JSON.stringify({
        dependencies: project.bower.dependencies,
        devDependencies: options.production ? [] : project.bower.devDependencies,
        resolutions: project.bower.resolutions,
        name: project.name
      }, null, 4);
      var errorLog = '';

      log.info('Bower Installing:', project.name);

      // TODO: remove sync methods
      fs.writeFileSync(project.tempPath + '/bower.json', bowerJson);
      if (project.bower.rc) {
        fs.writeFileSync(project.tempPath + '/.bowerrc', JSON.stringify(project.bower.rc));
      }

      var cmd = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'bower');
      var args = ['install', '--config.interactive=false'];
      if (options.production) {
        args.push('--production');
      }
      var cli = spawn(cmd, args, { cwd: project.tempPath });

      cli.stdout.on('data', function (data) {
        if (data && data.length > 0) {
          log.debug(data.toString().trim());
        }
      });

      cli.stderr.on('data', function (data) {
        if (data && data.length > 0) {
          errorLog += data.toString().trim();
          log.debug(data.toString().trim());
        }
      });

      cli.on('close', function (code) {
        cli.kill('SIGINT');
        if (code === 0) {
          log.info('Bower Install complete:', project.name);
          fs.unlink(project.tempPath + '/bower.json', function () {
            fs.unlink(project.tempPath + '/.bowerrc', function () {
              return resolve();
            });
          });
        } else {
          return reject(errorLog);
        }

      });
    });


  };

  return {
    install: install
  }
};
