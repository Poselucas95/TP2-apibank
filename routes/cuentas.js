var express = require('express');
var dataCuentas = require('../data/cuentas')
var router = express.Router();

/* GET cuentas listing. */
router.get('/', function(req, res, next) {
  res.send('cuentas, respond with a resource');
});

router.get(`/getAccount/:acc`, async function(req, res, next) {

    var account = await dataCuentas.getAccount(req.params.acc)
    if(account && account != {}){
      res.send(account, 200)
    }else {
      res.send("Account not found", 404)
    }
})

module.exports = router;