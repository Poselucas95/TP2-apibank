var express = require('express');
var router = express.Router();

/* GET cuentas listing. */
router.get('/', function(req, res, next) {
  res.send('cuentas, respond with a resource');
});

module.exports = router;