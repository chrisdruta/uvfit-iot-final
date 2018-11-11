var db = require("../db");

var deviceSchema = new db.Schema({
	photonId: { type: String, required: true, unique: true},
	userId: { type: String, required: true},
	data: [String],
});

var Device = db.model("Device", deviceSchema);
module.exports = Device;
