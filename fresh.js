var http = require('http');
var express = require('express');
var md = require( "markdown" ).markdown
var fs = require('fs');

var app = express();

if(process.argv.length != 3) {
	console.log("error: need a markdown file to watch.");
	process.exit(1);
}

filename = process.argv[2];

function sendFile() {
	fs.readFile(filename, 'ascii', function read(err, data) {
		if (err) {
			throw err;
		}

		io.sockets.emit('update', data);
	});
}

fs.watchFile(filename, function(curr, prev) {
	if(curr.mtime.getTime() == prev.mtime.getTime()) {
		console.log("mtime equal");
	} else {
		console.log("mtime not equal");
		console.log("sending update...");
		
		sendFile();
	}   
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});

io.sockets.on('connection', function(socket) {
	var address = socket.handshake.address.address;
	console.log("connection " + address + " accepted.");

	sendFile();

	socket.on('disconnect', function() {
		console.log("connected broken.");
	});
});

server.listen(3000);
console.log('Listening on port 3000');
