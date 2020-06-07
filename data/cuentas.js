const db = require("./conecction");



async function getAccounts(id) {
  var clientmongo = await db.getConnection();
  var account = await clientmongo
    .db("apibank")
    .collection("cuentas")
    .find({ account_id: id })
    .toArray();
  return account;
}

module.exports = { getAccounts };

/* 
var collection = await clientmongo
.db("apibank")
.collection("cuentas")
.find()
.sort({ $natural: -1 })
.limit(1)
.toArray(); */