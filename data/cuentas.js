const db = require("./conecction")


async function getCuentas() {
    var clientmongo = await db.getConnection()
     var collection = await clientmongo.db("apibank").collection("cuentas").find().sort({$natural:-1}).limit(1).toArray();
     return collection
}


module.exports = {getCuentas}