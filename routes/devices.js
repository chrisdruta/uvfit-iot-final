var express = require('express');
var router = express.Router();

var jwt = require("jwt-simple");

var User = require("../models/users");
var Device = require("../models/devices");

const SPEED_BIKE = 14;
const SPEED_RUN = 10;

const CALORIES_BIKE = 240/ 20/ 60;
const CALORIES_RUN = 490/ 20/ 60;
const CALORIES_WALK = 120 / 20/ 60;

function getNewApikey() {
	var newApikey = "";
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 32; i++) {
		newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return newApikey;
}

router.post('/register', (req, res) => {
	/**
	 * POST /devices/register endpoint that register endpoint
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * 		JSON containing device photonId
	 * Output:
	 * 		JSON containing success status and auth key
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, "megachadz");
		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				res.status(401).json({
					success: false,
					error: err
				});

			else if (user) {
				Device.findOne({
					photonId: req.body.photonId
				}, (err, device) => {
					if (err)
						res.status(401).json({
							success: false,
							error: err
						});

					else if (!device) {
						const apiKey = getNewApikey();
						const newDevice = new Device({
							photonId: req.body.photonId,
							userEmail: decoded.email,
							apiKey: apiKey
						});

						newDevice.save((err, createdDevice) => {
							if (err)
								res.status(400).json({
									success: false,
									error: err
								});

							else {
								user.devices.push(req.body.photonId)
								user.save((err, savedUser) => {
									if (err)
										res.status(400).json({
											success: false,
											error: err
										});
									else
										res.status(201).json({
											success: true,
											apiKey: apiKey
										});
								});
							}
						});
					} else
						res.status(400).json({
							success: false,
							error: "Device already registered"
						});

				});
			} else {
				res.status(401).json({
					success: false,
					error: 'Invalid authentfication token'
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

router.delete('/remove', (req, res) => {
	/**
	 * DELETE /devices/remove endpoint that removes specified device
	 * 
	 * Input:
	 * 		Encoded JWT in header
	 * 		JSON containing device photonId
	 * Output:
	 * 		JSON containing success status
	 */

	if (!req.headers['x-auth'])
		return res.status(401).json({
			success: false,
			error: "Authentification parameter(s) missing"
		});

	const authToken = req.headers['x-auth'];

	try {
		const decoded = jwt.decode(authToken, "megachadz");
		User.findOne({
			email: decoded.email
		}, (err, user) => {
			if (err)
				res.status(401).json({
					success: false,
					error: err
				});

			else if (user) {

				Device.findOneAndDelete({
					photonId: req.body.photonId
				}, (err, removedDevice) => {
					if (err)
						console.log(err);
				});
				console.log(req.body.photonId)
				console.log(user.devices)
				let newDevices = [];
				for (dev of user.devices) {
					if (dev != req.body.photonId)
						newDevices.push(dev)
				}
				user.devices = newDevices
				console.log(newDevices)
				user.save((err, savedUser) => {
					if (err)
						console.log(err);
					else
						res.status(201).json({success: true});
				});

			} else {
				res.status(401).json({
					success: false,
					error: 'Invalid authentfication token'
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

router.post('/data', (req, res) => {
	
	Device.findOne({
		photonId: req.body.deviceId
	}, (err, device) => {
		if (err)
			res.status(400).json({
				success: false,
				error: err
			});

		else if (device) {
			if (device.apiKey == req.body.apikey) {

				if (req.body.command) {
					if (req.body.command == 'start') {

						User.findOne({
							email: device.userEmail
						}, (err, user) => {
							if (err)
								res.status(401).json({
									success: false,
									error: err
								})
							else if (user) {
								user.activities.push({
									id: user.activities.length + 1,
									startDateTime: new Date(),
									endDateTime: null,
									type: null,
									uvExposure: -1,
									caloriesBurned: 0,
									route: []
								});

								user.save((err, savedUser) => {
									if (err)
										return res.status(400).json({
											success: false,
											error: err
										});
									else if (savedUser) {
										device.dataBuffer = [];
										device.save((err, savedDevice) => {
											if (err)
												return res.status(400).json({
													success: false,
													error: err
												});
											else if (savedDevice)
												return res.status(201).json({successStart: true});
											else
												return res.status(400).json({
													success: false,
													error: 'Failed to save device'
												});
										})
									} else
										res.status(400).json({
											error: "Failed to save user"
										})
								})
							}
						});
					} else if (req.body.command == 'end') {
						User.findOne({
							email: device.userEmail
						}, (err, user) => {
							if (err)
								res.status(401).json({
									success: false,
									error: err
								})
							else if (user) {
								activity = user.activities.pop()

								activity.endDateTime = new Date();
								let avgSpeed = 0;

								for (data of device.dataBuffer) {
									if (data.uv > activity.uvExposure)
										activity.uvExposure = data.uv;
									avgSpeed += data.speed;
									activity.route.push({
										long: data.long,
										lat: data.lat
									});
								}
								avgSpeed = avgSpeed / device.dataBuffer.length;

								if (avgSpeed >= SPEED_BIKE)
									activity.type = 'bike';
								else if (avgSpeed >= SPEED_RUN)
									activity.type = 'run';
								else
									activity.type = 'walk';

								let time = (activity.endDateTime - activity.startDateTime)/1000;
								switch (activity.type) {
									case 'bike':
										activity.caloriesBurned = time * CALORIES_BIKE;
										break;
									case 'run':
										activity.caloriesBurned = time * CALORIES_RUN;
										break;
									case 'walk':
										activity.caloriesBurned = time * CALORIES_WALK;
								}
								console.log(activity)
								user.activities.push(activity);

								user.save((err, savedUser) => {
									if (err)
										return res.status(400).json({
											success: false,
											error: err
										});
									else if (savedUser) {
										return res.status(201).json({successEnd: true});
									} else
										res.status(400).json({
											error: "Failed to save user"
										})
								})
							}
						});
					}
				} else {
					device.dataBuffer.push({
						long: req.body.longitude,
						lat: req.body.latitude,
						speed: req.body.speed,
						uv: req.body.uvLight
					});
					device.save((err, modifiedDevice) => {
						if (err)
							res.status(400).json({
								success: false,
								error: err
							});
						else
							res.status(201).json({
								success: true,
							});
					});
				}

			} else
				res.status(400).json({
					success: false,
					error: 'Device apikey does not match'
				});
		} else
			res.status(400).json({
				success: false,
				error: 'Device not registered'
			});
	});

});

module.exports = router;
