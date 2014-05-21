/**
 * Default Configuration.
 * See https://github.com/mozilla/node-convict/blob/master/README.md for details.
 */
var convict = require('convict');

module.exports = function () {

  // Check if we need to auto configure for a fast start.
  require('./autoconfig')();

  var conf = convict({
    // TODO: this option does not matter right now.
    env: {
      doc: "The applicaton environment.",
      format: ["production", "development", "test"],
      default: "development",
      env: "NODE_ENV"
    },
    log: {
      level: {
        default: 'info',
        env: 'LOG_LEVEL'
      }
    },
    ip: {
      doc: "The IP address to bind.",
      format: "ipaddress",
      default: "127.0.0.1",
      env: "IP_ADDRESS"
    },
    port: {
      doc: "The port to bind.",
      format: "port",
      default: 8872,
      env: "PORT"
    },
    password: {
      doc: "The password that is used to create Freight bundles.",
      format: String,
      default: ''
    },
    storage: {
      // TODO: You need to create this directory if it does not exist.
      // This directory is also used as a static file directory for Freight bundles.
      doc: "Default bundle storage directory. Make sure it is somewhere in the Freight Server directory.",
      format: String,
      default: 'storage'
    },
    // Redis config, see https://github.com/learnboost/kue#redis-connection-settings
    redis: {
      port: {
        doc: "Redis Port",
        format: "port",
        default: 6379
      },
      host: {
        doc: "Redis IP address to bind.",
        format: "ipaddress",
        default: "127.0.0.1"
      },
      auth: {
        doc: "Redis Password.",
        format: String,
        default: ''
      },
      options: {
        doc: "Redis Options.",
        format: Object,
        default: {}
      }
    }
  });

  // load environment dependent configuration
  //var env = conf.get('env');
  var env = 'development';
  // TODO: development only for now, change it later.
  conf.loadFile('./config/' + env + '.json');
  // perform configuration validation
  conf.validate();

  return conf;
};
