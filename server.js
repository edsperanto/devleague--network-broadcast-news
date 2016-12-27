const net = require('net');

let socketList = [];

let server = net.createServer(function(socket) {

	let address = socket.address().address;
	let port = socket.address().port;

	socketList.push(socket);
	socket.setEncoding('utf8');

	console.log(`CONNECTED: ${address}:${port}`);
	socket.write(`CONNECTED TO: ${address}:${port}`);
	
	socket.on('data', (chunk) => {
		chunk = chunk.substr(0, chunk.length - 1);
		broadcast(chunk, socket, address, port);
		console.log(`SERVER BCAST FROM ${address}:${port} : ${chunk}`);
	});

	process.stdin.on('data', (cmd) => {
		socket.write(cmd);
	});

	socket.on('end', () => {
		console.log(`CLOSED: ${address}:${port}`);
		socketListPop(socket);
	});

});

function broadcast(msg, origin, address, port) {
	for(let i = 0; i < socketList.length; i++) {
		if(socketList[i] === origin) {
			socketList[i].write("MESSAGE SENT");
		}else{
			socketList[i].write(`${address}:${port}: "${msg}"`);
		}
	}
}

function socketListPop(origin) {
	let i = socketList.indexOf(origin);
	socketList.splice(i, 1);
}

server.listen(6969, '0.0.0.0', function() {
	console.log(`Server listening on ${this.address().address}:${this.address().port}`);
});