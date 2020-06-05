var express = require('express');
var router = express.Router();

/* GET debitos listing. */
router.get('/', function(req, res, next) {
  res.send('debitos, respond with a resource');
});

module.exports = router;