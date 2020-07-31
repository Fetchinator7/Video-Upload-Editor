const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

const mainOutputFolder = process.env.MAIN_OUTPUT_FOLDER;

router.post('/', (req, res) => {
  const userName = req.body.userName;
  const videoTitle = req.body.videoTitle;
  const videoPath = req.body.videoPath;
  console.log('post to video');
  if (userName !== undefined) {
    const pyProcess = spawn('python3', ['server/dependencies/local_operations.py', mainOutputFolder, videoPath, videoTitle, userName]);
    pyProcess.stdout.on('data', (data) => {
      console.log(data.toString());
      res.status(200).send({ output: data.toString() });
    });
    pyProcess.stderr.on('data', (data) => {
      console.log(data.toString());
      res.status(500).send({ output: data.toString() });
    });
  } else {
    console.log("Error that's an invalid user.");
    res.sendStatus(400);
  }
});

module.exports = router;
