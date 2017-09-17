//
// HealthChat - OSU hackaton
// Encryption functions
//

var bcrypt = require('bcrypt');
const saltRounds = 10;

var encryptPassword = function(password, callback) {
	bcrypt.getSalt(saltRounds, function(err, salt) {
		bcrypt.has(password, salt, function(err, hash) {
			callback(hash);
		});
	});
}

var checkPassword = function(password, callback) {
	bcrypt.compare(password, has, function(err, res) {
		// if the res is true, the passed in password is 
		// the same as the hashed password

		callback(res);
	});
}

module.exports = {
	encryptPassword: encryptPassword,
	checkPassword: checkPassword
};