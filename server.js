var express = require('express');
var path = require('path');
var parser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();
var port = 8000;
//var db = 'healthchat';
var db = '';
var url = 'mongodb://heroku_cdsnp58c:6hmqg1i0en9ffmonrn2uuaoem2@ds139984.mlab.com:39984/heroku_cdsnp58c' + db;

// Implement sessions
var session = require('client-sessions');

app.use(session({
	cookieName: 'session',
	secret: 'thesecretkey',
	duration: (1000 * 60 * 30),
	activeDuration: (1000 * 60 * 10)
}));

// Sockets
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Include the public style and client side js files
app.use(express.static(path.join(__dirname + '/public')));

// import the users database functions
var usersDataBase = require('./databases/users.js');

// create the users database
usersDataBase.createUserDB();

// create a test user (this function prevents multiple users)
usersDataBase.deleteUser('testUser');
usersDataBase.deleteUser('usertwo');
usersDataBase.deleteUser('hashtest');

usersDataBase.insertUser("foo", "bar", "testUser", "helloworld", "nurse");
usersDataBase.insertUser("Jill", "Smith", "usertwo", "password", "nurse");
usersDataBase.insertUser("Bill", "Bob", "hashtest", "abcABC123", "doctor");

// import the rooms database functions
var roomsDataBase = require('./databases/rooms.js');

///////////////////////////////
// Encryption
// Messages are now automatically encrypted.
// To decrypt, use   -->   encrypt.decryptMessage(encrypted-hash, callback(plaintext-string) { do stuff });
// to encrypt stuff  -->   encrypt.encryptMessage(plaintext-string, callback(encrypted-hash) { do stuff });
///////////////////////////////
var encrypt = require('./encryption.js');


app.set('port', port);
app.set('view engine', 'ejs');

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
	res.render('login');
});

app.get('/logout', function(req, res) {
	req.session.reset();
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
	// User authentication process for logging in
	var login = usersDataBase.authenticate((req.body.username), (req.body.password), function(result) {
		if (result) {
			console.log('Welcome, ' + req.body.username + ' was logged in succesfully');
			req.session.username = req.body.username;
			res.render('home', { username: req.body.username, roomList: "" });
		} else {
			res.render('login');
		}
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

// Will search the collections for rooms matching the proper pattern
app.post('/roomSearch', function(req, res) {
	mongo.connect(url, function(err, db) {
		db.listCollections().toArray(function(err, results) {			
			// Put the rooms into a table
			var rooms = "<table id='roomstable'><thead><th>Rooms</th></thead><tbody>";
		
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
	mongo.connect(url, function(err, db) {
		db.listCollections().toArray(function(err, results) {
			var rname = "room" + req.body.roomAdd;
			var found = 0;
			
			// Check each room
			for (room in results) {
				// Make sure the room doesn't already exist
				if (results[room].name === rname) found = 1;
			}
			
			if (found === 0) {
				roomsDataBase.createRoomsDB(Number(req.body.roomAdd));
			}

			res.render('home', { username: req.session.username, roomList: "" });
		});
	});
});

// USER LOGIN SCREEN
app.post('/newuser', function(req, res) {
	res.render('newuser');
});

// Create the new user and go back to the login screen
app.post('/createUser', function(req, res) {
	usersDataBase.insertUser(req.body.firstname, req.body.lastname, req.body.username, req.body.password, req.body.type);
	res.render('login');
});

app.get(['/room*'], function(req, res) {
	var roomname = req.url.split("room").pop();
	res.render('room', { username: req.session.username, roomname: roomname });
});

io.on('connection', function(socket) {
	console.log('User connected...');
	
	// Store messages that were sent
	socket.on('sendNewMsg', function(msg) {
		roomsDataBase.storeMessage(msg.room, msg.message, msg.user);

		mongo.connect(url, function(err, db) {
			if (err) throw err;

			db.collection("room" + msg.room).find().toArray(function(err, results) {
				if (err) throw err;

				var msgs = [];

				for (result in results) {
					var m = {
						sender: results[result].sender,
					};
					
					var d = new Date(results[result].timestamp).toISOString();
					m.timestamp = String(d);
					
					encrypt.decryptMessage(results[result].message, function(decryptMsg) {
						m.message = decryptMsg;
						msgs.push(m);
					});
				}

				socket.emit('showNewMsg', {
					msgs: msgs
				});
			});
		});
	});
	
	// For a room, get the messages for that room
	socket.on('getMsgs', function(rm) {		
		mongo.connect(url, function(err, db) {
			if (err) throw err;

			db.collection("room" + rm.rmname).find().toArray(function(err, results) {
				if (err) throw err;

				var msgs = [];

				for (result in results) {
					var m = {
						sender: results[result].sender,
					};
					
					var d = new Date(results[result].timestamp).toISOString();
					m.timestamp = String(d);
					
					encrypt.decryptMessage(results[result].message, function(decryptMsg) {
						m.message = decryptMsg;
						msgs.push(m);
					});
				}

				socket.emit('recvMsgs', {
					msgs: msgs
				});
			});
		});
	});
});

server.listen(port);
