
function send(payload, socket, io) {
  socket.emit(payload);
}

module.exports = {
  send
};
