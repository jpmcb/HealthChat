// Send a message to the room
function sendMessage(room) {
	var socket = io();

	var msg = {
		message: document.getElementById('message').value,
		room: room,
		user: document.getElementById('userName').innerHTML
	};
		
	if (document.getElementById('message').value !== "") {
		socket.emit('sendNewMsg', msg);
		
		socket.on('showNewMsg', function(result) {
			result.msgs.sort(sortMsgs);

			var msgResults = "";

			for (msg in result.msgs) {
				msgResults += "<div id='msg'>";
				msgResults += result.msgs[msg].sender + " " + result.msgs[msg].timestamp + "<br>";
				msgResults += result.msgs[msg].message;
				msgResults += "</div><br>";
			}
	
			document.getElementById('storedMsgs').innerHTML = msgResults;
		});
	}
	
	document.getElementById('message').value = "";
}