var express = require('express');
var router = express.Router();
var dataDebitos = require("../data/debitos");


// POST Debito
router.post("/:alias", async function (req, res, next){
  var newDebit = await dataDebitos.newDebit(req.params.alias, req.body)
  if(newDebit === 1){
    res.send("Account not found", 404)
  }
  if(newDebit === 2){
    res.send("The reason is null", 400)
  }
  if(newDebit === 3){
    res.send("The ammout must be above 0", 400)
  }
  if(newDebit === 4){
    res.send("The account's limit isn't enough", 400)
  }
  if(newDebit === 5){
    res.send("Transaction added correctly", 200)
  }
})



module.exports = router;