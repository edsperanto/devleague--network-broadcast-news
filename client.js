const net = require('net');

let client = net.createConnection(6969, 'localhost');
client.setEncoding('utf8');

client.on('connect', () => {
	process.stdin.pipe(client);
});

client.on('data', function(chunk) {
	console.log(chunk);
});