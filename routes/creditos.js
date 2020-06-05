var express = require('express');
var router = express.Router();

/* GET creditos listing. */
router.get('/', function(req, res, next) {
  res.send('creditos, respond with a resource');
});

module.exports = router;