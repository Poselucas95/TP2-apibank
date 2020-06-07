const db = require("./conecction");
var _ = require("lodash");

async function getClients() {
  var clientmongo = await db.getConnection();
  var collection = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find()
    .toArray();
  return collection;
}

async function getClient(dni) {
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();
  return client;
}

async function newClient(values) {
  const params = [
    "person_id",
    "name",
    "surname",
    "adress",
    "email",
    "password",
  ];
  const validateParams = [];
  Object.entries(values).map((response) => {
    params.includes(response[0]) ? validateParams.push(response[0]) : null;
  });

  var dif = _.difference(params, validateParams);
  if (dif.length > 0) {
    return dif;
  }

  var clientmongo = await db.getConnection();
  var cli = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(values.person_id) })
    .toArray();

  if (cli.length > 0) {
    return 2;
  }

  var auxParams = [];
  Object.entries(values).forEach((res) => {
    if (params.includes(res[0])) {
      var a = res[0];
      auxParams.push();
    }
  });

  console.log(auxParams);

  return 1;
}

module.exports = { getClients, getClient, newClient };

/* .insertOne(object)
        .then((res) => {
          console.log(chalk.green(`Se insertó ${res.insertedCount} inventor`));
          return res;
        })
        .catch((err) => {
          console.log(chalk.red(err));
        });
    })
    .catch((err) => console.log(chalk.red(err)));
 */
/* 
var collection = await clientmongo
.db("apibank")
.collection("cuentas")
.find()
.sort({ $natural: -1 })
.limit(1)
.toArray(); */

/* 
client_id: 100001,
person_id: 22432311,
salary: 1000000,
name: "Marcos",
surname: "Galperin",
address: "Arias 3751, 7, Capital Federal (1430), Capital Federal, Argentina",
email: "marcos@meli.com",
password: "$2b$12$YjMZPFrj1qS6I/Zy1bxlgOV402ijFcNE.6YVueL5FoWK3eE/QVgKu",
accounts: [
111111,
111112
] */
