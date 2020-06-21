const db = require("./conecction");
const _ = require("lodash");
const validator = require("validator").default;
const chalk = require("chalk");

async function newDebit(alias, values) {
  if (
    !values.reason || typeof values.reason !== "string" ||
    validator.isEmpty(values.reason) ||
    values.reason.length < 2
  ) {
    return 2;
  }
  if (!values.amount || values.amount < 0) {
    return 3;
  }
  var clientmongo = await db.getConnection();
  var account = await clientmongo
    .db("apibank")
    .collection("cuentas")
    .find({ alias: alias })
    .toArray();

  if (account && account.length !== 1) {
    return 1;
  }

  if(account[0] && account[0].balance + account[0].limit - values.amount < 0){
      return 4
  }

  var objectToPost = {
    date: new Date(),
    origin: "api",
    alias: alias,
    type: "debito",
    amount: values.amount,
    reason: values.reason,
  };

  var accountTransaction = await clientmongo
    .db("apibank")
    .collection("transacciones")
    .find({ account_id: parseInt(account[0].account_id) }).toArray();

  await clientmongo
    .db("apibank")
    .collection("transacciones")
    .updateOne(
      { account_id: parseInt(account[0].account_id) },
      {
        $set: {
          transactions: accountTransaction[0].transactions.concat(objectToPost),
          transaction_count: accountTransaction[0].transaction_count + 1,
        },
      }
    );

  await clientmongo
    .db("apibank")
    .collection("cuentas")
    .updateOne(
      { account_id: parseInt(account[0].account_id) },
      {
        $set: {
          balance: account[0].balance - values.amount,
        },
      }
    );

  return 5;
}

module.exports = { newDebit };
