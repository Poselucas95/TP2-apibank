var express = require('express');
var dataCuentas = require('../data/cuentas')
var router = express.Router();

/* GET cuentas listing. */
router.get('/', function(req, res, next) {
  res.send('cuentas, respond with a resource');
});

router.get('/getCuentas', async function(req, res, next) {
  var collection = await dataCuentas.getCuentas();
  res.send(collection, 404)
})

module.exports = router;