//
// HealthChat - OSU hackaton
// Encryption functions
//

// module needed to encrypt passwords
var bcrypt = require('bcrypt');

// module for encrypting messages
var crypto = require('crypto');
var algorithm = 'aes192';
var password = 'abcdef';

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

// function to encrfypt messages going into the database
var encryptMessage = function(message, callback) {
	var cipher = crypto.createCipher(algorithm, password);
	var crypted = cipher.update(message, 'utf8', 'hex');
	crypted += cipher.final('hex');

	callback(crypted);
}

// function to decrypt messagse going out of the database
var decryptMessage = function(message, callback) {
	var decipher = crypto.createDecipher(algorithm, password);
	var decrypt = decipher.update(message, 'hex', 'utf8');
	decrypt += decipher.final('utf8');

	callback(decrypt);
}

module.exports = {
	encryptPassword: encryptPassword,
	checkPassword: checkPassword,
	encryptMessage: encryptMessage,
	decryptMessage: decryptMessage
};