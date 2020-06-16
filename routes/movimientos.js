var express = require("express");
var router = express.Router();
var dataMovimientos = require("../data/movimientos");

// GET cuentas
router.get("/:account", async function (req, res, next) {
    var accounts = await dataMovimientos.getMovimientos(req.params.account);
    if(accounts === 1){
      res.send('Account not found', 404)
    }
    if (accounts && accounts.length > 0) {
      res.send(accounts, 200);
    } else {
      res.send("The account has no transactions", 200);
    }
});



module.exports = router;
