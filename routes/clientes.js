var express = require("express");
var router = express.Router();
var dataClientes = require("../data/clientes");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

  if(Array.isArray(newClient)){
    res.send(`The following parameters are missing: ${newClient}`, 400)
  }

  if(newClient === 2){
    res.send('The client allready exits', 400)
  }

  res.send('ok', 200)
});

module.exports = router;
