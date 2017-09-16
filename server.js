var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();
var port = 8000;
var db = 'healthchat';
var url = 'mongodb://localhost:27017/' + db;


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

app.post('/home', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.collection('users').findOne({
			username: req.body.username
		}, function(err, result) {
			if (result === null || result.password !== req.body.password) {
				res.render('login');
			} else {
				res.render('home', { username: req.body.username });

				// Test code that creates a room22 collection, stores a basic
				// message in that collection, and then searches the collection
				// for that message. See the rooms.js file for further documentation
				roomsDataBase.createRoomsDB(22);
				roomsDataBase.storeMessage(22, 'Hello world! I am a message!', 'testUser');
				roomsDataBase.searchMessages(22, 'Hello world', function(result) {
					console.log(result);
				});
			}	
			db.close();
		});
	});
});

app.listen(port);