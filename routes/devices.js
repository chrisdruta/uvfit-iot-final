var express = require('express');
var router = express.Router();

var jwt = require("jwt-simple");

var User = require("../models/users");
var Device = require("../models/devices");

function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
       newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return newApikey;
}

router.post('/register', (req, res) => {
	if (!req.headers['x-auth'])
		return resp.status(401).json({success: false, error: "Authentification parameter(s) missing"});

	const authToken = req.headers['x-auth'];
	const photonIdRe = /[a-f0-9]+/;

	if (!photonIdRe.test(req.body.photonId))
		res.status(400).json({success: false, error: 'Request missing valid photon device id'})

	try {
		const decoded = jwt.decode(authToken, "megachadz");
		User.findOne({email: decoded.email}, (err, user) => {
			if (err)
				res.status(401).json({success: false, error: err});

			else if (user) {
				Device.findOne({photonId: req.body.photonId}, (err, device) => {
					if (err)
						res.status(401).json({success: false, error: err});

					else if (!device) {
						const apiKey = getNewApikey();
						const newDevice = new Device({
							photonId: req.body.photonId,
							userEmail: decoded.email,
							apiKey: apiKey
						});

						newDevice.save((err, createdDevice) => {
							if (err)
								res.status(400).json({success: false, error: err});

							else {
								User.updateOne({email: decoded.email}, {$push: {devices: req.body.photonId}});
								res.status(201).json({success: true, apiKey: apiKey});
							}
						});
					}

					else
						res.status(400).json({success: false, error: "Device already registered"});
						
				});
			}

			else {
				console.log('error: decoded user not found');
				res.status(401).json({success: false, error: 'Invalid authentfication token'});
			}

		});
	}
	catch (ex) {
		console.log(`caught error: ${ex}`);
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
