var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

http.listen(3000, function(){
  console.log('listening on *:3000');
});
 

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/chat.html');
}); 

var usernames = {};
 
function check_key(v){
	var val = '';	
	for(var key in usernames)  {
		if(usernames[key] == v)
		val = key;
	}
	return val;
}
 
io.sockets.on('connection', function (socket) { 
	
	socket.on('sendchat', function (data) {		
		io.sockets.emit('updatechat', socket.username, data);
	}); 
	
	socket.on('adduser', function(username){	
		socket.username = username;		
		usernames[username] = socket.id;	
		socket.emit('updatechat', 'SERVER', 'you have connected');		
		socket.emit('store_username', username);	
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected: ' + socket.id);	
		io.sockets.emit('updateusers', usernames);
	}); 
	
	socket.on('disconnect', function(){	
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});	
	
	socket.on('check_user', function(asker, id){	         	
		io.sockets.socket(usernames[asker]).emit('msg_user_found', check_key(id));
	});	
	
	socket.on('msg_user', function(usr, username, msg) {		
		io.sockets.socket(usernames[usr]).emit('msg_user_handle', username, msg); 	
	}); 
 
});