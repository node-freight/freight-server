var express = require('express');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

module.exports = function (conf, app) {

  var freighter = require('../lib/freighter')(conf);
  var FreightRoutes = {};

  FreightRoutes.check = function (req, res) {
    // TODO: refactor
    if (!req.body && !req.body.project && !req.body.project.name) {
      res.send(404);
    } else {

      var project = req.body.project;
      var extra = req.body.extra;
      // TODO: Switch to something else or keep md5?
      project.hash = crypto.createHash('md5').update(JSON.stringify(project)).digest('hex');
      // storage directory for projects
      project.storageDir = conf.get('storage');
      // path where tar.gz will be saved
      project.bundlePath = path.join(project.storageDir, project.name + '-' + project.hash + '.tar.gz');
      // temp storage directory where things install to
      project.tempPath = path.join(project.storageDir, project.hash);

      console.log(project);
      console.log(extra);

      project.npmInstall = [];

      // TODO: refactor
      if (project.npm) {
        if (project.npm.dependencies) {
          Object.keys(project.npm.dependencies).forEach(function (key) {
            project.npmInstall.push({ name: key, version: project.npm.dependencies[key] });
          });
        }
        if (project.npm.devDependencies) {
          Object.keys(project.npm.devDependencies).forEach(function (key) {
            project.npmInstall.push({ name: key, version: project.npm.devDependencies[key] });
          });
        }
      }

      // check if Freight file exists
      fs.exists(project.bundlePath, function (bundleExists) {
        var response = {
          creating: false,
          available: false,
          authenticated: extra.password === conf.get('password')
        };

        if (bundleExists) {
          response.available = true;
          response.hash = project.hash;
        }

        if (extra.password === conf.get('password') && extra.create === 'true') {
          // TODO: delete stale jobs, try again to cache, fail if tries too many times.
          // TODO: job in progress with the same hash should stop this one.
          // TODO: restart stale job if timeout > x.
          if (!bundleExists || extra.force === 'true') {
            response.creating = true;
            freighter.create(project, extra);
          }
        }

        res.json(response);

      });
    }
  };

  FreightRoutes.download = function (req, res) {
    console.log('download');

    if (req.body.hash) {
      var hashFile = path.join(conf.get('storage'), req.body.name + '-' + req.body.hash + '.tar.gz');

      fs.exists(hashFile, function () {
        res.sendfile(hashFile);
      });
    } else {
      res.send(404);
    }

  };

  return FreightRoutes;
};
