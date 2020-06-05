var express = require('express');
var router = express.Router();

/* GET clientes listing. */
router.get('/', function(req, res, next) {
  res.send('clientes, respond with a resource');
});

module.exports = router;