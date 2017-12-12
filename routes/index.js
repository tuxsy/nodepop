var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) { // next function is not used
  res.locals.title = res.__('Express');
  res.render('index');
});

module.exports = router;
