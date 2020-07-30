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
    if (body.transcode.status === 'complete') {
      console.log('Your video finished transcoding.');
    } else if (body.transcode.status === 'in_progress') {
      console.log('Your video is still transcoding.');
    } else {
      console.log('Your video encountered an error during transcoding.', error);
    }
    res.sendStatus(statusCode);
  });
});

router.post('/', (req, res) => {
  const file = req.body.file;
  const title = req.body.title;
  const description = req.body.description;
  console.log('Uploading...');
  vimeoClient.upload(
    file,
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
      console.log(uploadPercentage + '%');
    },
    function (error) {
      console.log('Failed because: ' + error);
      res.sendStatus(500);
    }
  );
});

// Change the video privacy
// Possible video privacy levels are: anybody, contact, disable, nobody, password, unlisted, and users.
router.patch('/', (req, res) => {
  const uri = req.body.uri;
  const view = req.body.view;
  const password = req.body.password;
  let privacyObj = {
    privacy: {
      view: view
    }
  };
  if (view === 'password') {
    privacyObj = { ...privacyObj, password: password };
  } else {
    vimeoClient.request({
      method: 'PATCH',
      path: `/videos/${uri}`,
      query: privacyObj
    }, function (error, body, statusCode, headers) {
      const logStr = `Updated privacy level to: "${view}".`;
      if (error) {
        console.log('Error:', error);
      } else if (view === 'password') {
        console.log(`${logStr} The new password is: "${password}"`);
      } else {
        console.log(logStr);
      }
      res.sendStatus(statusCode);
    });
  }
});

module.exports = router;
