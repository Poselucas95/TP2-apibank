const db = require("./conecction");
const _ = require("lodash");
const validator = require("validator").default;
const chalk = require("chalk");

async function newCredit(alias, values) {
  if (
    !values.reason ||
    typeof values.reason !== "string" ||
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

  var objectToPost = {
    date: new Date(),
    origin: "api",
    alias: alias,
    type: "credito",
    amount: values.amount,
    reason: values.reason,
  };

  var accountTransaction = await clientmongo
    .db("apibank")
    .collection("transacciones")
    .find({ account_id: parseInt(account[0].account_id) })
    .toArray();

  console.log(accountTransaction[0]);
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
          balance: account[0].balance + values.amount,
        },
      }
    );

  return 4;
}

module.exports = { newCredit };
