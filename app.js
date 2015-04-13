var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var conf = require('./config/config')();
var log = require('./lib/log')(conf);
var kue = require('kue');

// TODO: move this? this is needed for the server to be able to track bundles
process.env.FREIGHT_PASSWORD = conf.get('password');

var index = require('./routes/index')(log, conf);
var bundleDelete = require('./routes/bundle_delete')(log, conf);
var bundleDownload = require('./routes/bundle_download')(log, conf);
var freightRoutes = require('./routes/freight')(log, conf);
var freightAuth = require('./lib/auth')(log, conf);

var app = express();
app.conf = conf;
app.log = log;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var bodyParserOptions = {
  limit: conf.get('limit') + 'kb'
};
app.use(bodyParser.json(bodyParserOptions));
app.use(bodyParser.urlencoded(bodyParserOptions));

app.post('/freight/check', freightRoutes.check);
app.post('/freight/download', freightRoutes.download);
app.post('/freight/track', freightRoutes.track);

app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/storage/*', freightAuth.middleware, bundleDownload);
app.get('/', freightAuth.middleware, index);
// TODO: temporary, quick way to add delete
app.get('/ui/delete/:file', freightAuth.middleware, bundleDelete);
app.use(freightAuth.middleware);
app.use('/freights', kue.app);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
