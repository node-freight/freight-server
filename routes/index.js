var fs = require('fs');
var filesize = require('filesize');
var async = require('async');
var path = require('path');
var moment = require('moment');

module.exports = function (log, conf) {

  // TODO: refactor this view
  return function (req, res) {
    var memory = process.memoryUsage();
    var storage = conf.get('storage');

    var data = {
      title: 'Freight Server',
      process: {
        heap: filesize(memory.heapUsed)
      }
    };

    fs.readdir(storage, function (err, files) {
      if (err) {
        log.error(err);
        throw err;
      }

      async.map(files,
        function (file, complete) {
          fs.stat(path.join(storage, file), function (err, stat) {
            stat.size = filesize(stat.size);
            stat.download = '/storage/' + file;
            stat.ctime = moment(stat.ctime).format('MMMM Do YYYY, h:mm:ss a');
            if (file.indexOf('tar.gz') > -1) {
              complete(err, { name: file, details: stat });
            } else {
              complete(err, {});
            }
          });
        },
        function (err, results) {
          if (err) {
            log.error('Failed to get statistics on all bundle files');
            throw err;
          }

          var bundles = results.filter(function (file) {
            return file.hasOwnProperty('name');
          });

          bundles.sort(function(a, b) {
            return b.details.mtime.getTime() - a.details.mtime.getTime();
          });

          data.files = bundles;
          res.render('index', data);
        });
    });
  };
};
