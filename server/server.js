require('dotenv').config();
// Boilerplate.
const express = require('express');
const bodyParser = require('body-parser');

// Add the routers I created.
const videoRouter = require('./routes/video.router');
const vimeoRouter = require('./routes/vimeo.router');

function setApp() {
  const app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    /* Routes */
    .use('/video', videoRouter)
    .use('/vimeo', vimeoRouter)
    // Serve static files
    .use(express.static('build'));
  return app;
}

module.exports = setApp;
