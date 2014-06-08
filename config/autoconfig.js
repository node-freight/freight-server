var fs = require('fs');
var crypto = require('crypto');

module.exports = function () {
  // check config, TODO: refactor
  if (!fs.existsSync('config/development.json')) {
    var buf = crypto.randomBytes(256);
    var hash = crypto.createHash('sha1').update(buf).digest('hex');

    // TODO: refactor
    console.log('***** NOTICE ****** \n');
    console.log('You are missing "config/development.json"');
    console.log('Creating a configuration automatically for you....');
    console.log('Your Freight Server password is: \n');
    console.log(hash);
    console.log('\n Use this password to generate bundles: \n "freight --url=http://example.com --create --password=' + hash + '"');
    var devSampleFile = JSON.parse(fs.readFileSync('config/development.json-dist'));
    devSampleFile.password = hash;
    fs.writeFileSync('config/development.json', JSON.stringify(devSampleFile), null, 4);
  }

};
