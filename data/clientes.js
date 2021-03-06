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

  if (
    typeof values.name !== "string" ||
    typeof values.address !== "string" ||
    typeof values.password !== "string" ||
    typeof values.email !== "string" ||
    typeof values.person_id !== "number" ||
    typeof values.salary !== "number" ||
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

  //validamos si el clientes esta en la coleccion
  var clientmongo = await db.getConnection();
  var cli = await clientmongo
    .db("apibank")
    .collection("clientes")
    .find({ person_id: parseInt(values.person_id) })
    .toArray();

  if (cli.length > 0) {
    return 2;
  }
  // validaciones de datos
  if (!validator.isEmail(values.email)) {
    return 4;
  }
  if (values.person_id.length < 7 || values.person_id.length > 8) {
    return 5;
  }
  if (!validator.isLength(values.password, { min: 4, max: 10 })) {
    return 6;
  }

  //buscamos id del ultimo cliente
  var clientId = await clientmongo
    .db("apibank")
    .collection("cli_id")
    .find()
    .sort({ $natural: -1 })
    .limit(1)
    .toArray();

  // encriptamos pass
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(values.password, salt);

  // insertamos el nuevo cliente
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

  // insertamos id en tabla perpetua
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
  if (values.address && !validator.isEmpty(values.address)) {
    updateObject.address = values.address;
  }
  if (values.email && validator.isEmail(values.email)) {
    updateObject.email = values.email;
  }
  if (
    values.password &&
    validator.isLength(values.password, { min: 4, max: 10 })
  ) {
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(values.password, salt);
    updateObject.password = hash;
  }

  // inserto actualizaciones
  await clientmongo
    .db("apibank")
    .collection("clientes")
    .updateOne({ person_id: client[0].person_id }, { $set: updateObject })
    .then((res) => {
      console.log(chalk.green(`Se modificó ${res.modifiedCount} registro`));
    })
    .catch((err) => {
      chalk.red("No se logro editar al cliente", err);
    });

  // muestro resultado
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

  // Validamos que las cuentas esten en cero
  if (client[0].accounts) {
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

    // Borramos las cuentas del cliente de la coleccion de cuentas (cuentas en cero)
    for (const element of client[0].accounts) {
      await clientmongo
        .db("apibank")
        .collection("cuentas")
        .deleteOne({ account_id: element });
    }
  }

  // Borramos el cliente de la coleccion de clientes
  await clientmongo.db("apibank").collection("clientes").deleteOne(client[0]);

  return 3
}

module.exports = {
  getClients,
  getClient,
  newClient,
  updateClient,
  deleteClient,
};
