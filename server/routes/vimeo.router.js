const express = require('express');
const router = express.Router();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accessToken = process.env.ACCESS_TOKEN;
console.log(clientID, clientSecret, accessToken);

router.post('/', (req, res) => {
  // const videoTitle = req.body.videoTitle;
  res.sendStatus(200);
});

const Vimeo = require('vimeo').Vimeo;
const client = new Vimeo(clientID, clientSecret, accessToken);

client.request({
  method: 'GET',
  path: '/tutorial'
}, function (error, body, statusCode, headers) {
  if (error) {
    console.log(error);
  }
  console.log(body);
});

module.exports = router;
