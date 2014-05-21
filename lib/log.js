var bunyan = require('bunyan');

module.exports = function (conf) {

  return bunyan.createLogger({
    name: 'freight-server',
    stream: process.stdout,
    level: conf.get('log').level
  });

};
