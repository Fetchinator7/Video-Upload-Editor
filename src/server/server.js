require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/video.router');
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build'));

app.use('/video', router);

// Start listening for requests on a specific port.
app.listen(PORT, () => {
  console.log('Running on port', PORT);
});
