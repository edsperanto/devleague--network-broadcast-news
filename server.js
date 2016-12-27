const net = require('net');

let socketList = [];

let users = {};

let server = net.createServer(function(socket) {

	let address = socket.address().address;
	let port = socket.address().port;
	let step = 1;

	socketList.push(socket);
	socket.setEncoding('utf8');

	console.log(`CONNECTED: ${address}:${port}`);
	socket.write(`CONNECTED TO: ${address}:${port}`);

	socket.write('\nWelcome to the shadow web! Do you have an account? [Y/n]');
	socket.on('data', (chunk) => {
		chunk = cleanse(chunk);
		switch(step) {
			case 1: // ask if account exists
				if(chunk == 'Y' || chunk == 'y') {
					socket.write('LOGIN SUCCESSFUL!');
					step = 99;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please create an account, what username would you like?');
					step = 2;
				}else{
					socket.write("LOGIN UNSUCCESSFUL, YOU WILL NOW BE DISCONNECTED FROM THE SHADOW WEB");
					socketListPop(socket, address, port);
				}
				break;
			case 2:
				break;
			case 99: // allow access to chat room
				broadcast(chunk, socket, address, port);
				console.log(`SERVER BCAST FROM ${address}:${port} : ${chunk}`);
				break;
			default: // stepping error
				console.log('ERROR: STEP DOES NOT EXIST');
				break;
		}
	});

	process.stdin.on('data', (msg) => {

		let socketActive = false;

		msg = '[ADMIN] ' + cleanse(msg);

		for(let i = 0; i < socketList.length; i++) {
			if(socketList[i] === socket) {
				socketActive = true;
			}
		}

		if(socketActive) {
			socket.write(msg);
		}
	});

	socket.on('end', () => {
		socketListPop(socket, address, port);
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

function socketListPop(user, address, port) {
	let i = socketList.indexOf(user);
	socketList.splice(i, 1);
	console.log(`CLOSED: ${address}:${port}`);
	user.end();
	user.destroy();
}

function cleanse(chunk) {
	chunk = String(chunk);
	chunk = chunk.substr(0, chunk.length - 1);
	return chunk.trim();
}

server.listen(6969, '0.0.0.0', function() {
	console.log(`Server listening on ${this.address().address}:${this.address().port}`);
});