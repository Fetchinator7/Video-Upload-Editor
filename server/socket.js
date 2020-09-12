const socketHandler = require('./sockets/socketIndex');

function connectSocket(app) {
  const io = require('socket.io')(app)
    .on('connection', socket => {
      console.log('Some client connected');
      socket.on('hey', data => {
        console.log('hey', data);
        socket.broadcast.emit('upload.progress', data);
      });
      socketHandler(socket, io);
    });
}

module.exports = connectSocket;
