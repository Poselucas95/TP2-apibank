var express = require('express');
var router = express.Router();
var dataCreditos = require("../data/creditos");


// POST Credito
router.post("/:alias", async function (req, res, next){
  var newCredit = await dataCreditos.newCredit(req.params.alias, req.body)
  if(newCredit === 1){
    res.send("Account not found", 404)
  }
  if(newAccount === 2){
    res.send("The reason is null", 400)
  }
  if(newAccount === 3){
    res.send("The ammout must be above 0", 400)
  }
  if(newAccount === 4){
    res.send("Transaction added correctly", 200)
  }
})



module.exports = router;