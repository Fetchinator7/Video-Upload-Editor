const express = require('express');
const router = express.Router();

// Import the api info from the .env file.
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accessToken = process.env.ACCESS_TOKEN;

// Create a new Vimeo request object.
const Vimeo = require('vimeo').Vimeo;
const vimeoClient = new Vimeo(clientID, clientSecret, accessToken);

// Confirm the input environment variable isn't undefined.
router.get('/verify-vimeo-credentials/:credential', (req, res) => {
  const credential = req.params.credential;
  try {
    if (process.env[credential] === undefined) {
      res.status(200).send(`Heads up! ${credential} is undefined so you can still select videos but you won't be able to upload them until that's been entered. `);
    } else {
      res.status(200).send('');
    }
  } catch {
    res.sendStatus(500);
  }
});

// Get the transcode status for the given video uri from Vimeo.
router.get('/transcode-status/:uri', (req, res) => {
  const uri = req.params.uri;
  vimeoClient.request(`/videos/${uri}?fields=transcode.status`, function (error, body, statusCode) {
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
  // Post the given video to Vimeo.
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
      console.log('Your video URI is: ' + uri.substr(8, uri.length));
      // Remove the "/videos/" at the beginning.
      res.send(uri.substr(8, uri.length));
    },
    function (bytesUploaded, bytesTotal) {
      // Show an uploaded percentage in the console.
      const uploadPercentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      console.log(uploadPercentage + '%');
    },
    function (error) {
      res.status(500).send('Failed because: ' + error);
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
      // A video's privacy can by set to a few values but only one has a password so add the
      // password to the request since the mode is password.
      visibilityObj = { ...visibilityObj, password: password };
    }
  }

  // The actual request to Vimeo.
  vimeoClient.request({
    method: 'PATCH',
    path: `/videos/${uri}`,
    query: visibilityObj
  }, function (error, body, statusCode) {
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
