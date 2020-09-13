require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files
app.use(express.static('build'));

const PORT = process.env.PORT || 5000;
const io = require('socket.io').listen(app.listen(PORT));

const videoRouter = require('./routes/video.router');
const vimeoRouter = require('./routes/vimeo.router');

// Make socket.io accessible to our routers from the req.
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/video', videoRouter);
app.use('/vimeo', vimeoRouter);

console.log('listening on port', PORT);

module.exports = app;
