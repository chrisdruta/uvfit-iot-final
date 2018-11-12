var express = require('express');
var router = express.Router();

var jwt = require("jwt-simple");

var User = require("../models/users");
var Device = require("../models/devices");

router.post('/register', (req, res) => {
	if (!req.headers['x-auth'])
		return resp.status(401).json({success: false, error: "Authentification parameter(s) missing"});

	const authToken = req.headers['x-auth'];
	const photonIdRe = /[a-f0-9]+/;

	if (!photonIdRe.test(req.body.photonId))
		res.status(400).json({success: false, error: 'Request missing valid photon device id'})

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({email: decoded.email}, (err, user) => {
			if (err)
				res.status(401).json({success: false, error: err});

			else if (user) {
				User.updateOne({email: decoded.email}, {$push: {devices: {}}})
			}

			else
				res.status(401).json({success: false, error: 'Invalid authentfication token'});

		});
	}
	catch (ex) {
		return res.status(401).json({success: false, error: 'Invalid authentfication token'});
	}
});

router.post('/data', (req, res) => {

	Device.updateOne({photonId: req.body.deviceId}, {$push: {data: req.body.payload}},
						(err) => { if (err) res.status(400).json({success: false, error: err});}
	);

	res.status(201).json({success: true});
});

module.exports = router;
