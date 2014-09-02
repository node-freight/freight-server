var express = require('express');

module.exports = function (log, conf) {

  var hasPassword = function() {
    return conf.get('password') !== '';
  }

  var checkPassword = function(password) {
    return !hasPassword() || password === conf.get('password');
  };

  var emptyMiddleware = function(req, res, next) { next(); };

  var authMiddleware = express.basicAuth(function(username, password) {
    return checkPassword(password);
  }, '** Note: Password is your Freight Server password **. Username is blank');

  return {
    checkPassword: checkPassword,
    middleware: (hasPassword() ? authMiddleware : emptyMiddleware)
  };

};
