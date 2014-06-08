var express = require('express');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

module.exports = function (log, conf) {

  var freighter = require('../lib/freighter')(log, conf);
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
      project.productionBundlePath = path.join(project.storageDir, project.name + '-production-' + project.hash + '.tar.gz');
      // temp storage directory where things install to
      project.tempPath = path.join(project.storageDir, project.hash);

      log.debug('Incoming Project', project, extra);

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
    log.debug('Download request', req.body);
    if (req.body.hash) {
      var hashFile = path.join(conf.get('storage'), req.body.name + '-' + req.body.hash + '.tar.gz');
      if (req.body.options && req.body.options.production === 'true') {
        hashFile = path.join(conf.get('storage'), req.body.name + '-production-' + req.body.hash + '.tar.gz');
      }

      fs.exists(hashFile, function (exists) {
        if (exists) {
          log.debug('Download bundle:', hashFile);
          return res.sendfile(hashFile);
        } else {
          log.debug('Bundle does not exist:', hashFile);
          return res.send(404);
        }
      });
    } else {
      log.debug('Hash not set.');
      return res.send(404);
    }

  };

  return FreightRoutes;
};
