var express = require('express');

module.exports = function (log, conf) {

  var checkPassword = function(password) {
    return conf.get('password') === '' || password === conf.get('password');
  };

  var emptyMiddleware = function(req, res, next) { next(); };

  var authMiddleware = express.basicAuth(function(username, password) {
    return (checkPassword(password));
  }, '** Note: Password is your Freight Server password **. Username is blank');

  return {
    checkPassword: checkPassword,
    middleware: (conf.get('password') === '' ? emptyMiddleware : authMiddleware)
  };

};
