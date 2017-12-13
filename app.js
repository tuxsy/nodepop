require('dotenv').config();

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');

// Nos guardamos el directorio raíz para los requires
global.__base = __dirname + '/';

i18n.configure({
  locales: [ 'en', 'es' ],
  directory: __dirname + '/locales'
});

var app = express();
app.use(i18n.init);

// i18n Middleware
app.use((req, res, next) => {
  const langHeader = req.get('Accept-Language');
  const lang = req.query.lang || langHeader || 'en';
  i18n.setLocale(req, lang);
  next();
});

// cargamos el conector a la base de datos
require('./app/lib/connectMongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// Rutas del Api V1
app.use('/api/v1/anuncios', require('./app/api/v1/anuncios'));
app.use('/api/v1/tags', require('./app/api/v1/tags'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  
  if (err.array) { // es un error de express-validator
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req) ? 
      { message: 'Not valid', errors: err.mapped() } : // para peticones de API
      `Not valid - ${errInfo.param} ${errInfo.msg}`;  // para otras peticiones
  }

  res.status(err.status || 500);
  
  if (isAPI(req)) { // si es un API devuelvo JSON
    console.log('API ERROR:', err)
    const errorMsg = err.type ? res.__(err.type) : err.message;
    res.json({ success: false, error: errorMsg });
    return;
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

function isAPI (req) {
  return req.originalUrl.indexOf('/api') === 0;
}

module.exports = app;
