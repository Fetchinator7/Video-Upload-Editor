const express = require('express');
const router = express.Router();

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accessToken = process.env.ACCESS_TOKEN;

const Vimeo = require('vimeo').Vimeo;
const vimeoClient = new Vimeo(clientID, clientSecret, accessToken);

// Get the transcode status for the given video uri.
router.get('/transcode-status/:uri', (req, res) => {
  const uri = req.params.uri;
  vimeoClient.request(`/videos/${uri}?fields=transcode.status`, function (error, body, statusCode, headers) {
    if (body.transcode) {
      if (body.transcode.status === 'complete') {
        res.status(statusCode).send('Finished');
      } else if (body.transcode.status === 'in_progress') {
        res.status(statusCode).send('Transcoding');
      } else {
        res.status(statusCode).send('error', error);
      }
    } else {
      res.status(statusCode).send(`Error, the requested video with the uri "${uri}" couldn't be found.`);
    }
  });
});

router.post('/', (req, res) => {
  const videoPath = req.body.videoPath;
  const title = req.body.title;
  const description = req.body.description;
  console.log('Uploading...');
  vimeoClient.upload(
    videoPath,
    {
      name: title,
      description: description
    },
    function (uri) {
      // Remove the "/videos/" at the beginning.
      console.log('Your video URI is: ' + uri.substr(8, uri.length));
      res.send(uri.substr(8, uri.length));
    },
    function (bytesUploaded, bytesTotal) {
      const uploadPercentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      // res.status(102).send(uploadPercentage + '%');
      // res.sendStatus(102);
      console.log(uploadPercentage + '%');
    },
    function (error) {
      res.status(500).send('Failed because: ' + error);
      // res.sendStatus(102);
    }
  );
});

// Change the video visibility
// Possible video visibility levels are: anybody, contact, disable, nobody, password, unlisted, and users.
router.patch('/', (req, res) => {
  const uri = req.body.uri;
  const view = req.body.view;
  const password = req.body.password;
  let visibilityObj = {
    privacy: {
      view: view
    }
  };

  if (!uri || !view) {
    res.sendStatus(400);
    return;
  }
  if (view === 'password') {
    if (!password) {
      // Since the visibility level is password an actual password is required, but it
      // wasn't provided so send a bad request error.
      res.sendStatus(400);
      return;
    } else {
      visibilityObj = { ...visibilityObj, password: password };
    }
  }
  
  vimeoClient.request({
    method: 'PATCH',
    path: `/videos/${uri}`,
    query: visibilityObj
  }, function (error, body, statusCode, headers) {
    const responseStr = `Updated video visibility level to: "${view}".`;
    if (error) {
      res.status(statusCode).send('Error:', error);
    } else if (view === 'password') {
      res.status(statusCode).send(`${responseStr} The new password is: "${password}"`);
    } else {
      res.status(statusCode).send(responseStr);
    }
  });
});

module.exports = router;
