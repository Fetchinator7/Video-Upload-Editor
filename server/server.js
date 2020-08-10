require('dotenv').config();
// Boilerplate.
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build'));

// Add the routers I created.
const videoRouter = require('./routes/video.router');
const vimeoRouter = require('../server/routes/vimeo.router');

app.use('/video', videoRouter);
app.use('/vimeo', vimeoRouter);

// Start listening for requests on a specific port.
app.listen(PORT, () => {
  console.log('Running on port', PORT);
});
