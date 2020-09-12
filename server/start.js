const setApp = require('./server');
const connectSocket = require('./socket');

const app = setApp();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT);
console.log('listening on port', PORT);
const serverSocket = connectSocket(server);

module.exports = serverSocket;
