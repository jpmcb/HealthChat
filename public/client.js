// Send a message to the room
function sendMessage(room) {
	var socket = io();
	var msg = {
		message: document.getElementById('message').value,
		room: room,
		user: document.getElementById('userName').innerHTML
	};
		
	socket.emit('sendNewMsg', msg);

}