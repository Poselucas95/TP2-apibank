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
    .collection("clientes")
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

  return 7;
}

module.exports = { getClients, getClient, newClient };
