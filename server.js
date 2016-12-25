const net = require('net');
//const fs = require('fs');

//let socketLog = fs.createWriteStream('socket.txt', { flags: 'a', defaultEncoding: 'utf8' });

//let msg = "";

let server = net.createServer((socket) => {
	//console.log(socket);
	socket.on('data', (chunk) => {
		//socket.destroy();
		console.log('message from', socket.localAddress);
		//socket.write(chunk);
	});
});

server.listen(6969, '0.0.0.0', function() {
	console.log('opened server on', this.address());
});