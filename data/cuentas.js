const db = require("./conecction");
const validator = require("validator").default;
const chalk = require("chalk");

async function getAccounts(dni) {
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();

  if (client && client.length !== 1) {
    return 1;
  }
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
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();
  if (client && client.length !== 1) {
    return 1;
  }
  if (
    (values.type === "CA" || values.type === "CC") && typeof values.type === "string" &&
    validator.isLength(values.alias, { min: 5, max: 15 })
  ) {
    var auxAccount = await clientmongo
      .db("apibank")
      .collection("cuentas")
      .find({ alias: values.alias })
      .toArray();
    if (auxAccount && auxAccount.length > 0) {
      return 2;
    }
    var lastAccount = await clientmongo
      .db("apibank")
      .collection("acc_id")
      .find()
      .sort({ $natural: -1 })
      .limit(1)
      .toArray();

    await clientmongo
      .db("apibank")
      .collection("cuentas")
      .insertOne({
        account_id: lastAccount[0].account_id + 1,
        alias: values.alias,
        type: values.type,
        limit: values.type === "CA" ? 0 : client[0].salary * 0.1,
        balance: 0,
      })
      .then((res) => {
        console.log(chalk.green(`Se insertó ${res.insertedCount} cuenta`));
      })
      .catch((err) => {
        console.log(chalk.red(err));
      });

    await clientmongo
      .db("apibank")
      .collection("clientes")
      .updateOne(
        { person_id: parseInt(dni) },
        { $set: { accounts: client[0].accounts.concat(lastAccount[0].account_id + 1) } }
      );

    await clientmongo
      .db("apibank")
      .collection("transacciones")
      .insertOne({ 
        account_id: lastAccount[0].account_id + 1,
        transaction_count: 0,
        transactions: []
      });

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

  if (account && account.length !== 1) {
    return 0;
  }

  if(validator.isLength(values.alias, { min: 5, max: 15 })){
    var searchAliasAccount = await clientmongo.db("apibank").collection("cuentas").find({alias: values.alias}).toArray();
    if(searchAliasAccount && searchAliasAccount.length > 0){
      return 0
    }
    await clientmongo.db("apibank").collection("cuentas").updateOne({ account_id: account[0].account_id }, { $set: { alias: values.alias }}).then(res => {
      console.log(chalk.green(`Se modificó ${res.modifiedCount} registro`));
      return 1;
    }).catch(err => {
      chalk.red("No se logro editar la cuenta", err);
    })
  }

  return 2;
}


async function deleteAccount(accountId) {
  var clientmongo = await db.getConnection();
  var account = await clientmongo
    .db("apibank")
    .collection("cuentas")
    .find({ person_id: parseInt(accountId) })
    .toArray();

    if(account && account.length !== 1){
      return 1
    }

    if(account[0].balance === 0){
      await clientmongo.db("apibank").collection("cuentas").deleteOne(account[0])
      .then((res) => {
        console.log(chalk.green("Se ha eliminado la cuenta: ", res));
        return 3
      })
      .catch((err) => {
        chalk.red("No se logro eliminar la cuenta ", err);
        return 2
      });
    }else{
      return 2
    }

}

module.exports = { getAccounts, newAccount, updateAccount, deleteAccount };
