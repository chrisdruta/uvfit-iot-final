var express = require('express');
var router = express.Router();

var User = require("../models/users");
var bcrypt = require("bcrypt-nodejs");

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.findOne({email: "coolguy12@fortnite.com"}, (err, user) => {
    if (err)
      res.status(500).json({error: err});
    else if (user)
      res.status(200).json(user);
    else
      res.status(200).json({error: "User not found"})
  });
});

module.exports = router;
