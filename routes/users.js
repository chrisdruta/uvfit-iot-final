var express = require('express');
var router = express.Router();

var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

var User = require("../models/users");
var Device = require("../models/devices");

var secret = "megachadz";
var DEFAULT_UV_LEVEL = 1

// Regular expressions described and taken from https://gist.github.com/ravibharathii/3975295
const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i;
const passRe = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/* GET users listing. */
router.get('/', (req, res, next) => {
	User.findOne({
		email: "coolguy12@fortnite.com"
	}, (err, user) => {
		if (err)
			res.status(500).json({
				error: err
			});

		else if (user)
			res.status(200).json(user);

		else
			res.status(200).json({
				error: "User not found"
			});
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

	User.findOne({
		email: req.body.email
	}, (err, user) => {
		if (err)
			res.status(401).json({
				success: false,
				error: err
			});

		else if (user) {
			bcrypt.compare(req.body.password, user.passwordHash, (err, isValid) => {
				if (err)
					res.status(401).json({
						success: false,
						error: err
					});

				else if (isValid)
					res.status(201).json({
						success: true,
						token: jwt.encode({
							email: user.email
						}, secret)
					});

				else
					res.status(401).json({
						success: false,
						error: "The email or password provided was invalid"
					});
			});
		} else
			res.status(401).json({
				success: false,
				error: "The email or password provided was invalid"
			});
	});
});

router.post('/register', (req, res) => {
	/**
	 * POST /user/register endpoint that creates a new user in the db
	 * 
	 * Input:
	 * 		JSON object containing items with keys: email, name, password
	 * Output:
	 * 		JSON containing registration information or error
	 */

	if (!req.body.email || !req.body.name || !req.body.password)
		return res.status(400).json({
			success: false,
			error: "Missing new user registration info"
		})

	if (emailRe.test(req.body.email) && passRe.test(req.body.password)) {
		bcrypt.hash(req.body.password, null, null, (err, hash) => {
			const newUser = new User({
				email: req.body.email,
				fullName: req.body.name,
				passwordHash: hash,
				uvLevel: DEFAULT_UV_LEVEL
			});

			newUser.save((err, user) => {
				if (err)
					res.status(400).json({
						success: false,
						error: err.errmsg
					});
				else
					res.status(201).json({
						success: true,
						message: `User has been created for email ${user.email}`
					});
			});
		});
	} else
		return res.status(400).json({
			success: false,
			error: "Given information doens't pass regex"
		});

});

router.put('/info', (req, res) => {
	/**
	 * PUT /user/update endpoint that updates a user's information
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * 		JSON object containing items to update with required password
	 * 		
	 * Output:
	 * 		JSON containing success status and list of errors that occured
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);

		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				res.status(401).json({
					success: false,
					error: err
				});
			else if (user) {
				bcrypt.compare(req.body.password, user.passwordHash, (async (err, isValid) => {
					if (err)
						res.status(401).json({
							success: false,
							error: err
						});

					else if (isValid) {

						updateErrorList = [];

						// Go through each non-null value to update
						if (req.body.fullName)
							user.fullName = req.body.fullName;

						if (req.body.uvLevel) {
							if (req.body.uvLevel <= DEFAULT_UV_MIN)
								updateErrorList.push({
									'uvLevel': "Given value is below minimum UV level"
								});
							else
								user.uvLevel = req.body.uvLevel;
						}

						if (req.body.email) {
							if (!emailRe.test(req.body.email))
								updateErrorList.push({
									'email': "Not a valid email address"
								});

							else {
								user.email = req.body.email;

								// Go through and update all of the user's devices
								Device.find({
									email: user.email
								}, (err, devices) => {
									if (err)
										res.status(401).json({
											success: false,
											error: err
										});

									else if (devices) {
										for (dev of devices) {
											dev.userEmail = req.body.email;
											dev.save((err, savedDev) => {
												if (err)
													updateErrorList.push({
														'email': `Database error while updating email for device ${dev.photonId}: ${err}`
													});
											});
										}
									}
								});
								// Sleep 1/2 a second to wait for devices to update and properly get error messages
								await sleep(500);
							}
						}

						if (req.body.newPassword) {
							if (req.body.newPassword != req.body.newPasswordConfirm)
								updateErrorList.push({
									'password': "New password doesn't match with it's confirmation"
								});
							else {
								bcrypt.hash(req.body.newPassword, null, null, (err, hash) => {
									if (err)
										updateErrorList.push({
											'password': `Bcrypt encountered an error hashing new password: ${err}`
										});
									else {
										user.passwordHash = hash;
									}
								});
								// Sleep for 1/4 second to make sure bcrpyt updates user password hash
								await sleep(250);
							}
						}

						user.save((err, savedUser) => {
							if (err)
								return res.status(400).json({
									success: false,
									error: err
								});
							else
								return res.status(201).json({
									success: true,
									errors: updateErrorList
								});
						});

					} else
						res.status(401).json({
							success: false,
							error: "The password provided was invalid"
						});
				}));
			} else {
				res.status(401).json({
					success: false,
					error: "The email or password provided was invalid"
				});
			}

		});
	} catch (ex) {
		return res.status(401).json({
			success: false,
			error: 'Invalid authentfication token'
		});
	}

});

router.get('/config', (req, res) => {
	/**
	 * GET /user/config endpoint that returns user's personal UV level
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * Output:
	 * 		JSON containing success status and UV configuration
	 */

	if (!req.headers['apikey'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const apiKey = req.headers['apikey'];

	Device.findOne({
		apiKey: apiKey
	}, (err, device) => {

		if (err) {
			return res.status(401).json({
				success: false,
				error: err
			});
		} else if (device) {

			User.findOne({
				email: device.userEmail
			}, (err, user) => {
				if (err)
					return res.status(400).json({
						success: false,
						error: err
					});
				else if (user)
					return res.status(200).send(user.uvLevel);
				else
					return res.status(400).json({
						success: false,
						error: 'Device\'s user not found'
					});
			});
		} else
			return res.status(401).json({
				success: false,
				error: 'Invalid authentfication'
			});
	});
});

router.get('/devices', (req, res) => {
	/**
	 * GET /user/devices endpoint that returns a JSON of user's device's information
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * Output:
	 * 		JSON containing an array of user's device's information
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				res.status(401).json({
					success: false,
					error: err
				});

			else if (user) {
				var deviceList = [];
				Device.find({
					userEmail: user.email
				}, (err, devices) => {
					if (err)
						res.status(401).json({
							success: false,
							error: err
						});

					else if (devices) {
						for (dev of devices)
							deviceList.push(dev.photonId)

						res.status(200).json({
							success: true,
							deviceList: deviceList
						});
					} else
						res.status(200).json({
							success: true,
							msg: "No registered devices"
						});
				});
			} else
				res.status(401).json({
					success: false,
					error: 'Invalid authentfication token'
				});
		});
	} catch (ex) {
		return res.status(401).json({
			success: false,
			error: 'Invalid authentfication token'
		});
	}
});

router.get('/activities', (req, res) => {
	/**
	 * GET /user/activities endpoint that returns list of user's activities
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * Output:
	 * 		JSON containing an array of user's activities
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				return res.status(401).json({
					success: false,
					error: err
				});

			else if (user) {
				return res.status(200).json({
					success: true,
					activities: user.activities
				});
			} else
				return res.status(401).json({
					success: false,
					error: 'Invalid authentfication token'
				});
		});
	} catch (ex) {
		return res.status(401).json({
			success: false,
			error: 'Invalid authentfication token'
		});
	}
});

router.get('/info', (req, res) => {
	/**
	 * GET /user/info endpoint that returns a JSON of user's information
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * Output:
	 * 		JSON containing user information
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, secret);
		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				res.status(401).json({
					success: false,
					error: err
				});

			else if (user) {
				res.status(200).json({
					success: true,
					name: user.fullName,
					email: user.email,
					uvLevel: user.uvLevel
				});

			} else
				res.status(401).json({
					success: false,
					error: 'Invalid authentfication token'
				});
		});
	} catch (ex) {
		return res.status(401).json({
			success: false,
			error: 'Invalid authentfication token'
		});
	}
});

module.exports = router;
