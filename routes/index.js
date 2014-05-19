var fs = require('fs');
var filesize = require('file-size');
var async = require('async');
var path = require('path');
var moment = require('moment');

module.exports = function (conf) {

  // TODO: refactor this view
  return function (req, res) {
    var memory = process.memoryUsage();
    var storage = conf.get('storage');

    var data = {
      title: 'Freight Server',
      process: {
        heap: filesize(memory.rss).human({ si: true })
      }
    };

    fs.readdir(storage, function (err, files) {
      if (err) throw err;

      async.map(files,
        function (file, complete) {
          fs.stat(path.join(storage, file), function (err, stat) {
            stat.size = filesize(stat.size).human({ si: true });
            stat.download = path.join(storage, file);
            stat.ctime = moment(stat.ctime).format('MMMM Do YYYY, h:mm:ss a');

            complete(err, { name: file, details: stat });

          });
        },
        function (err, results) {
          if (err) throw err;

          data.files = results;
          res.render('index', data);
        });
    });
  };
};
