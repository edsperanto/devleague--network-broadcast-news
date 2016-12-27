const net = require('net');

let socketList = [];

let server = net.createServer(function(socket) {

	socketList.push(socket);
	socket.setEncoding('utf8');
	
	socket.on('data', (chunk) => {
		broadcast(chunk);
	});

	process.stdin.on('data', (cmd) => {
		socket.write(cmd);
	});

	socket.on('end', () => {
		console.log(`server disconnected from client`);
	});

});

function broadcast(msg) {
	for(let i = 0; i < socketList.length; i++) {
		socketList[i].write(msg);
		console.log(msg);
	}
}

server.listen(6969, '0.0.0.0', function() {
	console.log('opened server on', this.address());
});