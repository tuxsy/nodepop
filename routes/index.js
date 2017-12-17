var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) { // next function is not used
  res.locals.title = res.__('Nodepop');
  res.locals.documentationLink = res.__('Vew project documentation');
  res.locals.runcode = res.__('Run to view the documentation');

  res.render('index');
});

module.exports = router;
