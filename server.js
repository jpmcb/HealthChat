var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();
var port = 8000;
var db = 'healthchat';
var url = 'mongodb://localhost:27017/' + db;

// Implement sessions
var session = require('client-sessions');

app.use(session({
	cookieName: 'session',
	secret: 'thesecretkey',
	duration: (1000 * 60 * 30),
	activeDuration: (1000 * 60 * 10)
}));

// import the users database functions
var usersDataBase = require('./databases/users.js');

// create the users database
usersDataBase.createUserDB();

// create a test user (this function prevents multiple users)
usersDataBase.insertUser("foo", "bar", "testUser", "helloworld", "nurse");

// import the rooms database functions
var roomsDataBase = require('./databases/rooms.js');

app.set('port', port);
app.set('view engine', 'ejs');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
	res.render('login');
});

app.get('/logout', function(req, res) {
	res.render('login');
});

app.get('/home', function(req, res) {
	if (req.session.username) {
		res.render('home', { username: req.session.username, roomList: "" });
	}
	else {
		res.render('login');
	}
});

app.post('/home', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('users').findOne({
			username: req.body.username
		}, function(err, result) {
			if (result === null || result.password !== req.body.password) {
				res.render('login');
			}
			else {
				req.session.username = req.body.username;
				res.render('home', { username: req.body.username, roomList: "" });
			}	
			db.close();
		});
	});
});

// Will search the collections for rooms matching the proper pattern
app.post('/roomSearch', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.listCollections().toArray(function(err, results) {
			// Put the rooms into a table
			var rooms = "<table><thead><th>Rooms</th></thead><tbody>";
		
			// Search the room name for names containing the search query string
			var rnametest = new RegExp(req.body.roomSearch);
		
			// Check each room
			for (room in results) {
				// Grab the part after "room" for testing
				var rnamefrag = results[room].name.split("room").pop();

				// Make sure the collection contains both "room" at the beginning
				// and the search query somewhere in the second half of the collection name
				if (/^room[a-z0-9]+$/.test(results[room].name) && rnametest.test(rnamefrag)) {
					// Put the name into a row
					rooms += "<tr><td><a href='/" + results[room].name + "'>";
					rooms += rnamefrag;
					rooms += "</a></td></tr>";
				}
			}
	
			rooms += "</tbody></table>";
		
			// Rerender the home page with the table of rooms
			res.render('home', { username: req.session.username, roomList: rooms });
		});
	});
});

// Add a room to the db
app.post('/roomAdd', function(req, res) {
	roomsDataBase.createRoomsDB(Number(req.body.roomAdd));
	res.render('home', { username: req.session.username, roomList: "" });
});

app.get(['/room*'], function(req, res) {
	var roomname = req.url.split("room").pop();
	res.render('room', { username: req.session.username, roomname: roomname });
});

app.listen(port);