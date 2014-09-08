var fs = require('fs');
var crypto = require('crypto');

module.exports = function (expectedConfigFile) {

  if (! fs.existsSync(expectedConfigFile)) {
    var buf = crypto.randomBytes(256);
    var hash = crypto.createHash('sha1').update(buf).digest('hex');

    // TODO: refactor
    console.log('***** NOTICE ****** \n');
    console.log('You are missing "' + expectedConfigFile + '"');
    console.log('Creating a configuration automatically for you....');
    console.log('Your Freight Server password is: \n');
    console.log(hash);
    console.log('\n Use this password to generate bundles: \n "freight --url=http://example.com --create --password=' + hash + '"');
    var devSampleFile = JSON.parse(fs.readFileSync(__dirname + '/dev.json-dist'));
    devSampleFile.password = hash;
    fs.writeFileSync(expectedConfigFile, JSON.stringify(devSampleFile), null, 4);
  }

};
