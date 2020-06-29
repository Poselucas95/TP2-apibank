const db = require("./conecction");
const validator = require("validator").default;
const chalk = require("chalk");

//busco cuenta por dni
async function getAccounts(dni) {
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();

  // si no lo encuentro
  if (client && client.length !== 1) {
    return 1;
  }
  // si encuentro armo el objeto a enviar
  if (client[0].accounts) {
    var accountsArray = [];
    for (const element of client[0].accounts) {
      var acc = await clientmongo
        .db("apibank")
        .collection("cuentas")
        .find({ account_id: element })
        .toArray();
      if (acc && acc.length === 1) {
        accountsArray.push(acc[0]);
      }
    }

    return accountsArray;
  }
}

async function newAccount(dni, values) {
  //busco el cliente
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();
  if (client && client.length !== 1) {
    return 1;
  }
  //valido los datos recibidos
  if (
    (values.type === "CA" || values.type === "CC") && typeof values.type === "string" &&
    validator.isLength(values.alias, { min: 5, max: 15 })
  ) {
    var auxAccount = await clientmongo
      .db("apibank")
      .collection("cuentas")
      .find({ alias: values.alias })
      .toArray();
    // si el alias ya existe se rechaza
    if (auxAccount && auxAccount.length > 0) {
      return 2;
    }
    //busco el ultimo numero de cuenta
    var lastAccount = await clientmongo
      .db("apibank")
      .collection("acc_id")
      .find()
      .sort({ $natural: -1 })
      .limit(1)
      .toArray();

    //inserto la cuenta en la coleccion
    await clientmongo
      .db("apibank")
      .collection("cuentas")
      .insertOne({
        account_id: lastAccount[0].account_id + 1,
        alias: values.alias,
        type: values.type,
        limit: values.type === "CA" ? 0 : client[0].salary * 0.1, //si es CC calculo el limit de credito
        balance: 0,
      })
      .then((res) => {
        console.log(chalk.green(`Se insertó ${res.insertedCount} cuenta`));
      })
      .catch((err) => {
        console.log(chalk.red(err));
      });

    // agrego la cuenta al array de cuentas del cliente
    await clientmongo
      .db("apibank")
      .collection("clientes")
      .updateOne(
        { person_id: parseInt(dni) },
        { $set: { accounts: client[0].accounts.concat(lastAccount[0].account_id + 1) } }
      );

    // agredo la cuenta en el log de transacciones
    await clientmongo
      .db("apibank")
      .collection("transacciones")
      .insertOne({ 
        account_id: lastAccount[0].account_id + 1,
        transaction_count: 0,
        transactions: []
      });

      // actualizamos el id en la coleccion de cuentas perpetuas
      await clientmongo
      .db("apibank")
      .collection("acc_id")
      .insertOne({
        account_id: lastAccount[0].account_id + 1,
      });

      return 0
  }
}


async function updateAccount(acc, values) {
  var clientmongo = await db.getConnection();
  var account = await clientmongo
    .db("apibank")
    .collection("cuentas")
    .find({ account_id: parseInt(acc) })
    .toArray();

  // si la cuenta no existe
    console.log(acc)
  if (account && account.length !== 1) {
    return 0;
  }
  // validamos que el alias cumpla la politica
  if(validator.isLength(values.alias, { min: 5, max: 15 })){
    var searchAliasAccount = await clientmongo.db("apibank").collection("cuentas").find({alias: values.alias}).toArray();
    if(searchAliasAccount && searchAliasAccount.length > 0){
      return 3
    }
    // Actualizo el alias
    await clientmongo.db("apibank").collection("cuentas").updateOne({ account_id: account[0].account_id }, { $set: { alias: values.alias }}).then(res => {
      console.log(chalk.green(`Se modificó ${res.modifiedCount} registro`));
      return 1;
    // si hay error
    }).catch(err => {
      chalk.red("No se logro editar la cuenta", err);
    })
  }
  return 2;
}


async function deleteAccount(accountId) {
  console.log(accountId)
  var clientmongo = await db.getConnection();
  var account = await clientmongo
    .db("apibank")
    .collection("cuentas")
    .find({ account_id: parseInt(accountId) })
    .toArray();
    //si no encuentro la cuenta
    if(account && account.length !== 1){
      return 1
    }
    //valido que le balance sea cero y borro
    if(account[0].balance === 0){
      await clientmongo.db("apibank").collection("cuentas").deleteOne(account[0])
      return 3
    //si no es es cero aviso
    }else{
      return 2
    }

}

module.exports = { getAccounts, newAccount, updateAccount, deleteAccount };
