// Nos guardamos el directorio raíz para los requires
global.__base = __dirname + '/';

require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const i18n = require('i18n');
const jwtAuth = require('./app/lib/jwtAuth');

i18n.configure({
  locales: [ 'en', 'es' ],
  directory: __dirname + '/locales'
});

const app = express();
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
app.use('/docs',express.static(path.join(__dirname, 'build')));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// Rutas del Api V1
app.use('/api/v1/anuncios', jwtAuth());
app.use('/api/v1/anuncios', require('./app/api/v1/anuncios'));

app.use('/api/v1/tags', jwtAuth());
app.use('/api/v1/tags', require('./app/api/v1/tags'));

app.use('/api/v1/auth', require('./app/api/v1/auth'));

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
    if (err.validationErrors) {
      const errors = [];
      for (let i = 0;i < err.validationErrors.length; i ++) {
        errors.push(res.__(err.validationErrors[i].msg));
      }
      res.json({ success:false, errors: errors });
      return;
    } else {
      const errorMsg = err.i18n ? res.__(err.i18n) : err.message;
      console.log(err.i18n ? 'API ERROR w/ i18n' : 'API ERROR', errorMsg, err);
      res.json({ success: false, error: errorMsg });
      return;
    }
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
