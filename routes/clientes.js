var express = require("express");
var router = express.Router();
var dataClientes = require("../data/clientes");



/* GET clientes listing. */
router.get("/:dni?", async function (req, res, next) {
  if (req.params.dni) {
    var client = await dataClientes.getClient(req.params.dni);
    if (client && client.length > 0) {
      res.send(client, 200);
    } else {
      res.send("Client not found", 404);
    }
  } else {
    var clients = await dataClientes.getClients();
    res.send(clients, 200);
  }
});

router.post("/", async function (req, res, next) {
  var newClient = await dataClientes.newClient(req.body);

  /*
  Errores: 2 - Ya existe el cliente. 3 - Se ingresaron parametros incorrectos. 4 - Email invalido. 5- El person id no es un int entre 7 y 8 caracteres [] - Faltan parametros por completar
  */

  if(Array.isArray(newClient)){
    res.send(`The following parameters are missing: ${newClient}`, 400);
  }

  switch (newClient) {
    case 2:
      res.send("The client allready exits", 400);
      break;
    case 3:
      res.send("Error: Entering empty parameters", 400);
      break;
    case 4:
      res.send("Error: Email invalid", 400);
      break;
    case 5:
      res.send("Error: person id must be between 7 and 8 characters", 400);
      break;
    case 6:
      res.send(
        "Error: password must Error: The password must be between 4 and 10 characters "
      );
      break;
    case 7:
      res.send("Ok", 200);
      break;
    case -1:
      res.send("Couldn't create the client", 400);
      break;
  }
});

module.exports = router;
