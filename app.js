var express = require("express");
var app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.status(200).send("Bienvenido a apibank v0.1");
});






const server = app.listen(port, (error) => {
  if (error) {
    return console.log(`Error: ${error}`);
  }
  console.log(`Server listening on port ${server.address().port}`);
});
