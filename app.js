var express = require("express");
var app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.status(200).send("Bienvenido a la aplicación del banco.");
});






const server = app.listen(port, (error) => {
  if (error) {
    return console.log(`Error: ${error}`);
  }
  console.log(`Server listening on port ${server.address().port}`);
});
