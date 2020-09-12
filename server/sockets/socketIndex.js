const messageHandler = require('./message.socket');

async function rootSocketHandler(socket, io) {
  socket.on('test', (data) => messageHandler.del(data, socket, io));

  // Disconnect
  socket.on('disconnect', () => {
    socket.disconnect(true);
  });
}

module.exports = rootSocketHandler;
