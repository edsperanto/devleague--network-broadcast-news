const net = require('net');
const reg = {
	alpha: /^[a-z]+$/i,
	lowerAlpha: /^[a-z]+$/,
	upperAlpha: /^[A-Z]+$/,
	alphaNum: /^[a-z0-9]+$/i
};

let socketList = [];

let users = {
	lol: 'ayylmao'
};

let server = net.createServer(function(socket) {

	let username = "";
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
			case 1: // Do you have an account?
				if(chunk == 'Y' || chunk == 'y') {
					socket.write('Please enter your username');
					step = 6;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please create an account, what username would you like?');
					step = 2;
				}else{
					socket.write('Please enter "y" or "n"');
					// socket.write("LOGIN UNSUCCESSFUL, YOU WILL NOW BE DISCONNECTED FROM THE SHADOW WEB");
					// socketListPop(socket, address, port);
				}
				break;
			case 2: // What username would you like?
				if(!reg.alpha.test(chunk.charAt(0))) {
					socket.write('The first character must be a letter');
					break;
				}
				if(!reg.alphaNum.test(chunk)) {
					socket.write('Username must only contain letters and numbers');
					break;
				}
				if(users[chunk] === undefined) {
					users[chunk] = "";
					username = chunk;
					socket.write(`Username "${username}" has been successfully created\nPlease create a new password:`);
					step = 4;
				}else{
					socket.write('This username has already been taken\nWould you like to login with this username? [Y/n]');
					step = 3;
				}
				break;
			case 3:  // Would you like to login with this username?
				if(chunk == 'Y' || chunk == 'y') {
					socket.write('LOGIN SUCCESSFUL WITH EXISTING USERNAME!');
					step = 99;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please create an account, what username would you like?');
					step = 2;
				}else{
					socket.write('Please enter "y" or "n"');
				}
				break;
			case 4: // Please create a new password:
				users[username] = chunk;
				socket.write('Your password has been successfully created');
				socket.write('Please re-enter your password to confirm:');
				step = 5;
				break;
			case 5: // Please re-enter your password to confirm:
				if(chunk === users[username]) {
					socket.write('SUCCESSFULLY CREATED ACCOUNT\nWelcome to the shadow web! Do you have an account? [Y/n]');
					step = 1;
				}else{
					socket.write('PASSWORD CONFIRMATION FAILED\nPlease create a new password:');
					step = 4;
				}
				break;
			case 6: // Please enter your username
				if(users[chunk] !== undefined) {
					socket.write('USERNAME EXISTS!!!');
					step = 99;
				}else{
					socket.write(`Username "${chunk}" does not exist\nWould you like to create it? [Y/n]`);
					username = chunk;
					step = 7;
				}
				break;
			case 7: // Auto create username if attempt during login
				if(chunk == 'Y' || chunk == 'y') {
					users[username] = "";
					socket.write(`Username "${username}" has been successfully created\nPlease create a new password:`);
					step = 4;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please enter your username');
					step = 6;
				}else{
					socket.write('Please enter "y" or "n"');
				}
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