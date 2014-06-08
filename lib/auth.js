var express = require('express');

module.exports = function (log, conf) {

  return express.basicAuth(function(username, password) {
    return (username === conf.get('password'));
  }, 'Note: Username is your Freight Server password. Leave password blank');

};
