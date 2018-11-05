var db = require("../db");

var userSchema = new db.Schema({
	email: { type: String, required: true, unique: true},
	fullName: { type: String, required: true},
	passwordHash: String,
	devices: [String] //TODO: Probably should change this array type from String to device schema 
});

var User = db.model("User", userSchema);
module.exports = User;
