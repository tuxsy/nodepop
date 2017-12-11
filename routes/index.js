var express = require('express');
var router = express.Router();
var i18n = require('i18n');

/* GET home page. */
router.get('/', function (req, res, next) {
  const lang = req.query.lang || 'en';
  console.log('lang', lang);
  i18n.setLocale(req, lang);
  res.locals.title = res.__('Express');
  res.render('index');
});

module.exports = router;
