var express = require('express');
var router = express.Router();

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
	/**
	 * POST /user/login endpoint that checks user credentials and provides an auth token
	 * 
	 * Input:
	 * 		JSON object containing items with keys: email, password
	 * Output:
	 * 		JSON containing jwt or error
	 */
	
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

router.post('/register', (req, resp) => {
	/**
	 * POST /user/register endpoint that creates a new user in the db
	 * 
	 * Input:
	 * 		JSON object containing items with keys: email, name, password
	 * Output:
	 * 		JSON containing registration information or error
	 */

	if (!req.body.email || !req.body.name || !req.body.password)
		return resp.status(400).json({success: false, error: "Missing new user registration info"})

	// Regular expressions described and taken from https://gist.github.com/ravibharathii/3975295
	const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i;
	const passRe = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

	if (emailRe.test(req.body.email) && passRe.test(req.body.password)) {
		bcrypt.hash(req.body.password, null, null, (err, hash) => {
			const newUser = new User({
				email: req.body.email,
				fullName: req.body.name,
				passwordHash: hash
			});

			newUser.save((err, user) => {
				if (err)
					resp.status(400).json({success: false, error: err.errmsg});
				else
					resp.status(201).json({success: true, message: `User has been created for email ${user.email}`});
			});
		});
	}

	else
		return resp.status(400).json({success: false, error: "Given information doens't pass regex"});

});

router.get('/devices', (req, resp) => {
	/**
	 * GET /user/devices endpoint that returns a JSON of user's device's information
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * Output:
	 * 		JSON containing an array of user's device's information
	 */
	
	if (!req.headers['x-auth'])
		return resp.status(401).json({success: false, error: "Authentification parameter(s) missing"});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({email: decoded.email}, (err, user) => {
			if (err)
				resp.status(401).json({success: false, error: err});
			
			else if (user) {
				const deviceData = {};
				
				for (photonId of user.devices) {
					Device.findOne({photonId: photonId}, (err, device) => {
						// Not that robust, but probably fine for the scope of the project
						if (device) {
							deviceData[photonId] = device.data;
						}
					})
				}
				resp.status(200).json({success: true, deviceData: deviceData});
			}

			else
				resp.status(401).json({success: false, error: 'Invalid authentfication token'});
		});
	}

	catch (ex) {
		return resp.status(401).json({success: false, error: 'Invalid authentfication token'});
	}
});

module.exports = router;
