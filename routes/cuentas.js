var express = require("express");
var router = express.Router();
var dataCuentas = require("../data/cuentas");

// GET cuentas
router.get("/:dni", async function (req, res, next) {
    var accounts = await dataCuentas.getAccounts(req.params.dni);
    if(accounts === 1){
      res.send('Client not found', 404)
    }
    if (accounts && accounts.length > 0) {
      res.send(accounts, 200);
    } else {
      res.send("Accounts not found", 404);
    }
});

// POST cuentas
router.post("/:dni", async function (req, res, next){
    var newAccount = await dataCuentas.newAccount(req.params.dni, req.body)
    if(newAccount === 1){
      res.send("Client not found", 404)
    }
    if(newAccount === 2){
      res.send("Error: params fail", 400)
    }
    if(newAccount === 0){
      res.send("Account create", 200)
    }
    res.send("Error", 400)
})

// Update cuenta
router.put("/:account", async function (req, res, next){
    var updateAccount = await dataCuentas.updateAccount(req.params.account, req.body)
    if(updateAccount === 0){
      res.send("account not found", 404)
    }
    if(updateAccount === 1){
      res.send("Error", 400)
    }
    if(updateAccount === 2 ){
      res.send("Update complete", 200)
    }
})


module.exports = router;
