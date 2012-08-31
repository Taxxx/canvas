var io = require('socket.io').listen(1380)

var clients = {};

io.sockets.on('connection', function (socket) {
  
	socket.on('addclient', function(id){
		socket.username = id;
		clients[id] = id;
		io.sockets.emit('updateclients', clients);
		socket.broadcast.emit('updateclients', clients);
	});
  
  socket.on('draw', function (data) {
    socket.broadcast.emit('draw', socket.username, data);
  });

  socket.on('disconnect', function() {
		delete clients[socket.username];
  });  
});