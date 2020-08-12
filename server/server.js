require('dotenv').config();
// Boilerplate.
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build'));

// Add the routers I created.
const videoRouter = require('./routes/video.router');
const vimeoRouter = require('./routes/vimeo.router');

app.use('/video', videoRouter);
app.use('/vimeo', vimeoRouter);

module.exports = app;
