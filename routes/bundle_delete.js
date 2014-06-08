var fs = require('fs');
var path = require('path');

module.exports = function (log, conf) {

  // TODO: refactor this view
  return function (req, res) {
    if (req.params.file) {
      fs.unlink(
        path.join(conf.get('storage'), req.params.file),
        function (err) {
          if (err) throw err;
          console.log('Bundle Deleted');
          res.redirect('/');
        });
    } else {
      res.send(404);
    }
  };
};
