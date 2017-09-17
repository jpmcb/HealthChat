//
// HealthChat - OSU hackaton
// Encryption functions
//

// module needed to encrypt passwords
var bcrypt = require('bcrypt');

// constant needed to salt the hashes
const saltRounds = 10;

// function to encrpyt the passwords passed into the function
var encryptPassword = function(password, callback) {
	bcrypt.genSalt(saltRounds, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
			if(err) throw err;

			//execute callback function passing the new salted hash
			callback(hash);
		});
	});
}

// function to check plaintext passwords against the hash
var checkPassword = function(password, hash, callback) {
	bcrypt.compare(password, hash, function(err, res) {
		// if the res is true, the passed in password is 
		// the same as the hashed password
		callback(res);
	});
}

module.exports = {
	encryptPassword: encryptPassword,
	checkPassword: checkPassword
};