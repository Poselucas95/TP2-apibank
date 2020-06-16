const db = require("./conecction");

async function getMovimientos(account) {
  var clientmongo = await db.getConnection();
  var movimientos = await clientmongo
    .db("apibank")
    .collection("transacciones")
    .find({ account_id: parseInt(account) })
    .toArray();


  if (movimientos && movimientos.length !== 1) {
    return 1;
  }
  if(movimientos[0].transactions && movimientos[0].transactions.length < 1){
    return 2
  }else{
    return movimientos[0].transactions
  }

}


module.exports = { getMovimientos };
