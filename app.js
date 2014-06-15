var path = require('path');

var conf = require('./config/config')();
var log = require('./lib/log')(conf);
// TODO: move this?
process.env.FREIGHT_PASSWORD = conf.get('password');

var express = require('express');
var bodyParser = require('body-parser');
var kue = require('kue');

var index = require('./routes/index')(log, conf);
var bundleDelete = require('./routes/bundle_delete')(log, conf);
var freightRoutes = require('./routes/freight')(log, conf);
var freightAuth = require('./lib/auth')(log, conf);

var app = express();
app.conf = conf;
app.log = log;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/freight/check', freightRoutes.check);
app.post('/freight/download', freightRoutes.download);
app.post('/freight/track', freightRoutes.track);

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/storage', express.static(path.join(__dirname, conf.get('storage'))));
app.get('/', freightAuth, index);
// TODO: temporary, quick way to add delete
app.get('/ui/delete/:file', freightAuth, bundleDelete);
app.use(freightAuth);
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
