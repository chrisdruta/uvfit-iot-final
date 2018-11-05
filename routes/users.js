var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

var User = require("../models/users");
var Device = require("../models/devices");

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

router.post('/login', (req, res) => {
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

router.post('/devices', (req, resp) => {
	if (!req.headers['x-auth'])
		return resp.status(401).json({success: false, error: "Authentification parameter(s) missing"});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({email: decoded.email}, (err, user) => {
			if (err)
				res.status(401).json({success: false, error: err});
			
			else if (user) {
				const deviceData = [];
				
				for (deviceId of user.devices) {
					Device.findOne({'_id': ObjectId(deviceId)}, (err, device) => {
						// Not that robust, but probably fine for the scope of the project
						if (device)
							deviceData.push(device);
					})
				}
				res.status(200).json({success: true, deviceData: deviceData});
			}

			else
				res.status(401).json({success: false, error: 'Invalid authentfication token'});
		});
	}

	catch (ex) {
		return res.status(401).json({success: false, error: 'Invalid authentfication token'});
	}
});

module.exports = router;
