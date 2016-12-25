const net = require('net');

let client = net.createConnection(6969, 'localhost');

client.on('connect', () => {
	console.log('connected');
	process.stdin.pipe(client);
});