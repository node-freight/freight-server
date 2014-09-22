var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');

module.exports = function (log) {

  var install = function (project, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {

      var npmJson = JSON.stringify({
        dependencies: project.npm.dependencies,
        devDependencies: options.production ? {} : project.npm.devDependencies,
        name: project.name
      }, null, 4);

      log.info('NPM Installing:', project.name);

      fs.writeFileSync(path.join(project.tempPath, 'package.json'), npmJson);

      if (project.npm.shrinkwrap) {
        var shrinkwrap = JSON.stringify(project.npm.shrinkwrap);
        fs.writeFileSync(path.join(project.tempPath, 'npm-shrinkwrap.json'), shrinkwrap);
      }

      var cmd = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'npm');
      var args = ['install', '--ignore-scripts'];
      if (options.production) {
        args.push('--production');
      }

      var cli = null;
      var errorLog = '';

      try {
        cli = spawn(cmd, args, { cwd: project.tempPath });
      } catch (e) {
        log.error('NPM Exception', e, 'with command', cmd);
      }

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
        log.info('NPM Install Complete:', project.name, 'Code:', code);
        if (code === 0) {
          fs.unlink(path.join(project.tempPath, 'package.json'), function () {
            fs.unlink(path.join(project.tempPath, 'npm-shrinkwrap.json'), function () {
              return resolve();
            });
          });
        } else {
          fs.unlink(path.join(project.tempPath, 'npm-debug.log'), function () {
            return reject(errorLog);
          });
        }

      });

    });
  };

  return {
    install: install
  }
};
