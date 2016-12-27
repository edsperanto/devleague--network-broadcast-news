const net = require('net');

let socketList = [];

let server = net.createServer(function(socket) {

	let address = socket.address().address;
	let port = socket.address().port;
	let step = 1;

	socketList.push(socket);
	socket.setEncoding('utf8');

	console.log(`CONNECTED: ${address}:${port}`);
	socket.write(`CONNECTED TO: ${address}:${port}`);

	socket.write('Welcome to the shadow web! Do you have an account? [Y/n]');
	socket.on('data', (chunk) => {
		chunk = cleanse(chunk);
		switch(step) {
			case 1:
				if(chunk !== 'n') {
					socket.write('LOGIN SUCCESSFUL!');
					step = 99;
				}
				break;
			case 99:
				broadcast(chunk, socket, address, port);
				console.log(`SERVER BCAST FROM ${address}:${port} : ${chunk}`);
				break;
			default:
				console.log('ERROR: STEP DOES NOT EXIST');
				break;
		}
	});

	process.stdin.on('data', (cmd) => {
		socket.write(cmd);
	});

	// socket.write("LOGIN UNSUCCESSFUL, YOU WILL NOW BE DISCONNECTED FROM THE SHADOW WEB");
	// socketListPop(socket);
	// socket.destroy();

	socket.on('end', () => {
		console.log(`CLOSED: ${address}:${port}`);
		socketListPop(socket);
	});

});

function broadcast(msg, user, address, port) {
	for(let i = 0; i < socketList.length; i++) {
		if(socketList[i] === user) {
			socketList[i].write("MESSAGE SENT");
		}else{
			socketList[i].write(`${address}:${port}: "${msg}"`);
		}
	}
}

function socketListPop(user) {
	let i = socketList.indexOf(user);
	socketList.splice(i, 1);
}

function cleanse(chunk) {
	chunk = chunk.substr(0, chunk.length - 1);
	return chunk.trim();
}

server.listen(6969, '0.0.0.0', function() {
	console.log(`Server listening on ${this.address().address}:${this.address().port}`);
});