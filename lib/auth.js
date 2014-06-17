var express = require('express');

module.exports = function (log, conf) {

  return express.basicAuth(function(username, password) {
    return (password === conf.get('password'));
  }, '** Note: Password is your Freight Server password **. Username is blank');

};
