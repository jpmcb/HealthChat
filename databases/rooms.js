//
// HealthChat - OSU hackathon Sept 16th
// Database file for managing the rooms
//


// variable to access the database
var mongo = require('mongodb').MongoClient;
var db = 'healthchat';
var url = 'mongodb://localhost:27017/' + db;


//
// This function creates a room collection. The collection will be named room + some number.
// For example, if the number 22 is passed to the function, there will be a room22 collection
// created
//

var createRoomsDB = function(room) {
	mongo.connect(url, function(err, db) {
		if(err) throw err;

		db.createCollection( ("room" + room), function(err, res) {
			if (err) throw err;
			console.log("room " + room + " collection created");
			db.close();
		});
	});
}


//
// This function stores the messages that are passed to the function in the specified room.
// For example, if the function is passed 22, "This is a message", and testUser, the collection 
// will now store that message in the room collection along with a unix timestamp
//

var storeMessage = function(room, message, sender) {

	var message = {
		sender: sender,
		timestamp: Date.now(),
		message: message,
	}

	mongo.connect(url, function(err, db) {
		db.collection("room" + room).insertOne(message, function(err, res) {
			if (err) throw err;
			console.log("The message was stored");
			db.close();
		});
	});
}


//
// This function searches the specified database for a message. A callback function is performed 
// with the resulting data. The messages that match the regexp query are sent as an array of objects
//

var searchMessages = function(room, searchQuery, callback) {
	mongo.connect(url, function(err, db) {
		if (err) throw err;

		db.collection("room" + room).find({ message: new RegExp(searchQuery) }).toArray(function(err, result) {
			if (err) throw err;
			db.close();

			callback(result);
		});
	});
}

//export the function to the server file
module.exports = {
	createRoomsDB: createRoomsDB,
	storeMessage: storeMessage,
	searchMessages: searchMessages
};
