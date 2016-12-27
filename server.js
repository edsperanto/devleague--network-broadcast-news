const net = require('net');
const TITLE = '4chan';
const reg = {
	alpha: /^[a-z]+$/i,
	alphaNum: /^[a-z0-9]+$/i
};
const SYS = {
	ENTER_CHAT: 'HAS ENTERED THE CHAT',
	LEFT: 'HAS LEFT THE CHAT',
	JOINED: 'HAS JOINED ' + TITLE.toUpperCase()
};

let socketList = [];

let users = {
	ADMIN: 'thereisnogod',
	lol: 'fuck',
	oh: 'shit'
};

let server = net.createServer(function(socket) {

	let step = 1;
	let attempts = 5;
	let my = {
		username: '',
		address: socket.address().address,
		port: socket.address().port
	}
	let settings = {
		anon: false,
		showPort: true,
		showIp: true,
		showSentReceipt: false
	}

	socket.setEncoding('utf8');

	console.log(`CONNECTED: ${my.address}:${my.port}`);
	socket.write(`CONNECTED TO: ${my.address}:${my.port}`);

	socket.write(`\nWelcome to ${TITLE}! Do you have an account? [Y/n]`);
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
					my.username = chunk;
					socket.write(`Username "${my.username}" has been successfully created\nPlease create a new password:`);
					step = 4;
				}else{
					socket.write('This username has already been taken\nWould you like to login with this username? [Y/n]');
					my.username = chunk;
					step = 3;
				}
				break;
			case 3:  // Would you like to login with this username?
				if(chunk == 'Y' || chunk == 'y') {
					socket.write('Please enter your password');
					step = 8;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please create an account, what username would you like?');
					step = 2;
				}else{
					socket.write('Please enter "y" or "n"');
				}
				break;
			case 4: // Please create a new password:
				users[my.username] = chunk;
				socket.write('Your password has been successfully created');
				socket.write('Please re-enter your password to confirm:');
				step = 5;
				break;
			case 5: // Please re-enter your password to confirm:
				if(chunk === users[my.username]) {
					socket.write('SUCCESSFULLY CREATED ACCOUNT\nWelcome to the shadow web! Do you have an account? [Y/n]');
					notification(SYS.JOINED, socket, my);
					step = 1;
				}else{
					socket.write('PASSWORD CONFIRMATION FAILED\nPlease create a new password:');
					step = 4;
				}
				break;
			case 6: // Please enter your username
				my.username = chunk;
				if(users[my.username] !== undefined) {
					socket.write('Please enter your password');
					step = 8;
				}else{
					socket.write(`Username "${chunk}" does not exist\nWould you like to create it? [Y/n]`);
					step = 7;
				}
				break;
			case 7: // Auto create username if attempt during login
				if(chunk == 'Y' || chunk == 'y') {
					users[my.username] = "";
					socket.write(`Username "${username}" has been successfully created\nPlease create a new password:`);
					step = 4;
				}else if(chunk == 'N' || chunk == 'n'){
					socket.write('Please enter your username');
					step = 6;
				}else{
					socket.write('Please enter "y" or "n"');
				}
				break;
			case 8: // Please enter your password
				if(chunk === users[my.username]) {
					socket.write('LOGIN SUCCESSFUL, WELCOME TO THE SHADOW WEB');
					socketList.push(socket);
					notification(SYS.ENTER_CHAT, socket, my);
					step = 99;
				}else{
					if(attempts == 0) {
						socket.write("LOGIN UNSUCCESSFUL, YOU WILL NOW BE DISCONNECTED FROM THE SHADOW WEB");
						console.log(`WARNING: LOGIN ATTEMPT FAILED FROM ${my.address}:${my.port}`);
						socketListPop(socket, my);
						break;
					}
					socket.write(`Incorrect password or username, you have [${attempts}] attempts remaining\nPlease enter your password`);
					attempts--;
				}
				break;
			case 99: // allow access to chat room
				broadcast(chunk, socket, my, settings);
				console.log(`SERVER BCAST FROM ${my.address}:${my.port} : ${chunk}`);
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
		socketListPop(socket, my);
	});

});

function broadcast(msg, user, my, settings) {
	for(let i = 0; i < socketList.length; i++) {
		if(settings.showSentReceipt) {
			socketList[i].write("MESSAGE SENT");
		}
		if(socketList[i] !== user) {
			socketList[i].write(`[${my.username}] (${my.address}:${my.port}) : "${msg}"`);
		}
	}
}
function notification(msg, user, my) {
	for(let i = 0; i < socketList.length; i++) {
		if(socketList[i] !== user) {
			socketList[i].write(`[${my.username}] (${my.address}:${my.port}) ${msg}`);
		}
	}
	console.log(`[${my.username}] (${my.address}:${my.port}) ${msg}`);
}

function socketListPop(user, my) {
	let i = socketList.indexOf(user);
	socketList.splice(i, 1);
	console.log(`CLOSED: ${my.address}:${my.port}`);
	user.end();
	user.destroy();
}

function cleanse(chunk) {
	chunk = String(chunk);
	chunk = chunk.substr(0, chunk.length - 1);
	return chunk.trim();
}

function rndStr() {

}

server.listen(6969, '0.0.0.0', function() {
	console.log(`Server listening on ${this.address().address}:${this.address().port}`);
});