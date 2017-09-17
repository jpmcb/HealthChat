// User database handaling functions
// OSU hackathon HealthChat group - Sept 16th 2017

// MongoClient handling variables (these can be changed)
var mongo = require('mongodb').MongoClient;
var db = 'healthchat';
var url = 'mongodb://localhost:27017/' + db;

var encrypt = require('../encryption.js');

//
// Creates the user database collection
//

var createUserDB = function() {
	// connect to the database
	mongo.connect(url, function(err, db) {
	 	if (err) throw err;

	  // create the user collection
		db.createCollection("users", function(err, res) {
	  		if (err) throw err;
	  		console.log("Collection created!");
	  		db.close();
	  	});
	});
}

//
// The findUser function will connect to the database and search for a given username.
// Upon the username being found, the callback function will execute
//

var findUser = function(username, callback) {

	mongo.connect(url, function(err, db) {
		if (err) {
			console.log(username + " dose not exist");
			db.close();

			// send a null signal out to the callback function
			callback(null);
		} else {
			db.collection("users").findOne( {username: username}, function(err, result) {
				if (err) throw err;
				db.close();

				// send out the results of the database query
				callback(result);
			});
		}
	});
}


//
// The insertUser function will search the database using the findUser function
// and if that username is not already taken, it will insert the user into the collection
//

// pass the users info to this function
var insertUser = function(firstname, lastname, username, password, type) {


	// connect to the database
	mongo.connect(url, function(err, db) {
		if (err) throw err;

		// search the database with the given username and execute the callback function
		findUser(username, function(result) {
			// assign the database object (may be null)
			var foundUser = result;

			// no match for the username was found, go ahead and insert new user
			if(foundUser == null || username != foundUser.username) {
				encrypt.encryptPassword(password, function(hash) {
				
					// the collection object to be inserted into the database
					var user = { 
						firstname: firstname, 
						lastname: lastname, 
						username: username, 
						password: hash, 
						type: type }
					

					db.collection("users").insertOne(user, function(err, res) {
						if (err) throw err;
						console.log("New user inserted into collection");
						db.close();
					});
				});
			} else {
				// a username was found, check to see if it matches the given username
				console.log("That username already exists or is invalid");
				db.close();
			}
		});		
	});
}

//
// This function deletes a user from the database
//

var deleteUser = function(username) {
	// set up a query variable to be passed to mongo
	var query = { username: username };

	mongo.connect(url, function(err, db) {
		if (err) throw err;

		// invoke the findUser function to see if this user even exists in the database
		findUser(username, function(result) {
			if(result == null)
			{   // This user dose not exist
				console.log("No user with username " + username + " was found");
				db.close();
			} else {  // The user dose exist, so delete them from the database
				db.collection("users").deleteOne(query, function(err, obj) {
					if (err) throw err;
					console.log("Deleted " + username + " user");
					db.close();
				});
			}
		});
		
	});
}

var authenticate = function(username, password, callback) {

	// first, look up the user in the database
	findUser(username, function(result) {
		// this user dose not exist
		if(result == null) {
			console.log('Authentication failed, no user found');
			callback(false);

		// the user was found, so check the password with the encryption functions
		} else {
			encrypt.checkPassword(password, result.password, function(res) {
				// the res return parameter will either be true or false
				if(res){
					console.log('Authentication passed, text password and hash are the same.');
					callback(res);
				} else {
					console.log('Authentication failed, passwords are not the same.');
					callback(res);
				}
			});
		}
	});

}

module.exports = {
	createUserDB: createUserDB,
	findUser: findUser,
	insertUser: insertUser,
	deleteUser: deleteUser,
	authenticate: authenticate
};

