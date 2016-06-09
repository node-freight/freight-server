var basicAuth = require('basic-auth');

module.exports = function (log, conf) {

  var hasPassword = function() {
    return conf.get('password') !== '';
  };

  var checkPassword = function(password) {
    return ! hasPassword() || password === conf.get('password');
  };

  var emptyMiddleware = function(req, res, next) { next(); };

  var authMiddleware = function (req, res, next) {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.send(401);
    }

    var user = basicAuth(req);

    if (! user || ! user.pass) {
      return unauthorized(res);
    }

    if (checkPassword(user.pass)) {
      return next();
    } else {
      return unauthorized(res);
    }
  };

  return {
    checkPassword: checkPassword,
    middleware: (hasPassword() ? authMiddleware : emptyMiddleware)
  };

};
