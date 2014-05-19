var conf = require('./config/config')();

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var kue = require('kue');
var auth = require('http-auth');

var index = require('./routes/index')(conf);
var bundleDelete = require('./routes/bundle_delete')(conf);
var freightRoutes = require('./routes/freight')(conf);
var freightAuth = require('./lib/auth')(conf);

var app = express();
app.conf = conf;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/freight/check', freightRoutes.check);
app.post('/freight/download', freightRoutes.download);

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
