var socket = io();

socket.on('showNewMsg', function(result) {		
	console.log(result);

	result.msgs.sort(sortMsgs);

	var msgResults = "";

	for (msg in result.msgs) {
		msgResults += "<div id='msg'>";
		msgResults += result.msgs[msg].sender + ": ";
		msgResults += result.msgs[msg].message;
		msgResults += "<br>" + result.msgs[msg].timestamp;
		msgResults += "</div><br>";
	}
	
	document.getElementById('storedMsgs').innerHTML = msgResults;
});
		
// Send a message to the room
function sendMessage(room) {
	var msg = {
		message: document.getElementById('message').value,
		room: room,
		user: document.getElementById('userName').innerHTML
	};
		
	if (document.getElementById('message').value !== "") {
		socket.emit('sendNewMsg', msg);
	}
	
	document.getElementById('message').value = "";
}