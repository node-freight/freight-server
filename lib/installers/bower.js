var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');
var Promise = require('bluebird');

module.exports = function(log) {

  var install = function (project, options) {
    options = options || {};
    return new Promise(function(resolve, reject){

      var bowerJson = JSON.stringify({
        dependencies: project.bower.dependencies,
        devDependencies: options.production ? [] : project.bower.devDependencies,
        name: project.name
      }, null, 4);

      log.info('Bower Installing:', project.name);

      // TODO: ugghh
      fs.writeFileSync(project.tempPath + '/bower.json', bowerJson);
      if (project.bower.rc) {
        fs.writeFileSync(project.tempPath + '/.bowerrc', JSON.stringify(project.bower.rc));
      }

      var cmd = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'bower');
      var args = ['install'];
      if (options.production) {
        args.push('--production');
      }
      var bowerCli = spawn(cmd, args, { cwd: project.tempPath });

      bowerCli.stdout.on('data', function (data) {
        if (data) {
          log.debug(data.toString());
        }
      });

      bowerCli.stderr.on('data', function (data) {
        if (data) {
          log.debug(data.toString());
        }
      });

      bowerCli.on('close', function (code) {
        log.info('Bower Install complete:', project.name);
        fs.unlink(project.tempPath + '/bower.json', function() {
          fs.unlink(project.tempPath + '/.bowerrc', function() {
            resolve();
          });
        });
      });
    });


  };

  return {
    install: install
  }
};
