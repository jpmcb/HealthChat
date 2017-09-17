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

app.post('/home', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('users').findOne({
			username: req.body.username
		}, function(err, result) {
			if (result === null || result.password !== req.body.password) {
				res.render('login');
			} else {
				req.session.username = req.body.username;
				res.render('home', { username: req.body.username, roomList: "" });
			}	
			db.close();
		});
	});
});

app.post('/roomSearch', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('rooms').find({
			roomNumber: {
				$regex: req.body.roomSearch,
				$options: "i"
			}
		}).toArray(function(err, results) {
			if (results === null) {
				res.render('home', { username: req.session.username, roomList: "No rooms found" });
			} else {
				var rooms = "<table><thead><th>Rooms</th></thead><tbody>";
				
				for (room in results) {
					rooms += "<tr><td><a href='/room" + results[room].roomNumber + "'>";
					rooms += results[room].roomNumber;
					rooms += "</a></td></tr>";
				}
				
				rooms += "</tbody></table>";
				
				res.render('home', { username: req.session.username, roomList: rooms });
			}
		});
	});
});

app.post('/roomAdd', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('rooms').insert({
			roomNumber: req.body.roomAdd
		}, function(err, result) {
			res.render('home', { username: req.session.username, roomList: "" });
			db.close();
		});
	});
});

app.listen(port);