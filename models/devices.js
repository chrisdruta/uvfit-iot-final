var db = require("../db");

var deviceSchema = new db.Schema({
	photonId: {
		type: String,
		required: true,
		unique: true
	},
	userEmail: {
		type: String,
		required: true
	},
	dataBuffer: {
		type: Array
	},
	apiKey: {
		type: String,
		unique: true
	}
});

var Device = db.model("Device", deviceSchema);
module.exports = Device;
