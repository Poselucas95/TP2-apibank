const db = require("./conecction");
const _ = require("lodash");
const validator = require("validator").default;
const chalk = require("chalk");

const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    "salary",
    "surname",
    "address",
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

  if (
    validator.isEmpty(values.name) ||
    values.person_id < 0 ||
    values.salary < 0 ||
    validator.isEmpty(values.surname) ||
    validator.isEmpty(values.address) ||
    validator.isEmpty(values.password) ||
    validator.isEmpty(values.email)
  ) {
    return 3;
  }

  if (!validator.isEmail(values.email)) {
    return 4;
  }
  if (values.person_id.length < 7 || values.person_id.length > 8) {
    return 5;
  }
  if (!validator.isLength(values.password, { min: 4, max: 10 })) {
    return 6;
  }

  var clientId = await clientmongo
    .db("apibank")
    .collection("cli_id")
    .find()
    .sort({ $natural: -1 })
    .limit(1)
    .toArray();

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(values.password, salt);

  await clientmongo
    .db("apibank")
    .collection("clientes")
    .insertOne({
      client_id: clientId[0].client_id + 1,
      person_id: values.person_id,
      salary: values.salary,
      name: values.name,
      surname: values.surname,
      address: values.address,
      email: values.email,
      password: hash,
      accounts: [],
    })
    .then((res) => {
      console.log(chalk.green(`Se insertó ${res.insertedCount} cliente`));
      return 7;
    })
    .catch((err) => {
      console.log(chalk.red(err));
      return -1;
    });

  await clientmongo
    .db("apibank")
    .collection("cli_id")
    .insertOne({
      client_id: clientId[0].client_id + 1,
    });

  return 7;
}

async function updateClient(dni, values) {
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();

  if (client && client.length !== 1) {
    return 0;
  }
  if (values.salary && values.salary < 0) {
    return 1;
  }

  var updateObject = {};
  if (values.salary) {
    updateObject.salary = values.salary;
  }
  if (!validator.isEmpty(values.address)) {
    updateObject.address = values.address;
  }
  if (validator.isEmail(values.email)) {
    updateObject.email = values.email;
  }
  if (validator.isLength(values.password, { min: 4, max: 10 })) {
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(values.password, salt);
    updateObject.password = hash;
  }

  await clientmongo
    .db("apibank")
    .collection("clientes")
    .updateOne({ person_id: client.person_id }, { $set: updateObject })
    .then((res) => {
      console.log(chalk.green(`Se modificó ${res.modifiedCount} registro`));
    })
    .catch((err) => {
      chalk.red("No se logro editar al cliente", err);
    });

  var newUpdateClient = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();

  return newUpdateClient;
}

async function deleteClient(dni) {
  var clientmongo = await db.getConnection();
  var client = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(dni) })
    .toArray();

  if (client && client.length !== 1) {
    return 1;
  }

  for (const element of client[0].accounts) {
    var acc = await clientmongo
      .db("apibank")
      .collection("cuentas")
      .find({ account_id: element })
      .toArray();
    if (acc && acc.length === 1) {
      if (acc[0].balance !== 0) {
        return 2;
      }
    }
  }
  for (const element of account[0].accounts) {
    await clientmongo
      .db("apibank")
      .collection("cuentas")
      .deleteOne({ account_id: element })
      .then((res) => {
        console.log(chalk.green("Se ha eliminado la cuenta: ", res));
      })
      .catch((err) => {
        chalk.red("No se logro eliminar la cuenta ", err);
      });
  }

  await clientmongo
    .db("apibank")
    .collection("clientes")
    .deleteOne(client[0])
    .then((res) => {
      console.log(chalk.green("Se ha eliminado el cliente: ", res));
      return 3;
    })
    .catch((err) => {
      chalk.red("No se logro eliminar el cliente ", err);
      return 2;
    });
}

module.exports = {
  getClients,
  getClient,
  newClient,
  updateClient,
  deleteClient,
};
