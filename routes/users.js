var express = require('express');
var router = express.Router();

var User = require("../models/users");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

var secret = "megachadz";

/* GET users listing. */
router.get('/', (req, res, next) => {
  User.findOne({email: "coolguy12@fortnite.com"}, (err, user) => {
    if (err)
      res.status(500).json({error: err});

    else if (user)
      res.status(200).json(user);

    else
      res.status(200).json({error: "User not found"});
  });
});

router.post('/login', (req, res, next) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if (err)
      res.status(401).json({success: false, error: err});

    else if (user) {
      bcrypt.compare(req.body.password, user.passwordHash, (err, isValid) => {
        if (err)
          res.status(401).json({success: false, error: err});

        else if (isValid)
          res.status(201).json({success: true, token: jwt.encode({email: user.email}, secret)});

        else
          res.status(401).json({success: false, error: "The email or password provided was invalid"});
      });
    }

    else
      res.status(401).json({success: false, error: "The email or password provided was invalid"});
  });
});

module.exports = router;
