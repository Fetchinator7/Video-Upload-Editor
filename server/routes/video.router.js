const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');
const { spawn } = require('child_process');

const mainOutputFolder = process.env.MAIN_OUTPUT_FOLDER;

router.post('/', (req, res) => {
  const videoPath = req.body.videoPath;
  const title = req.body.title;
  const userName = req.body.userName;
  const description = req.body.description;
  if (userName !== undefined) {
    // TODO Handle error correctly.
    const pyProcess = spawn('python3', ['server/dependencies/local_operations.py', mainOutputFolder, videoPath, title, userName]);
    pyProcess.stdout.on('data', (data) => {
      // The data object is what's sent to the python console which has the messages and the
      // output path in {}:
      // {
      //   the raw output is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application.\n{/...New Title.mp4}\n"
      //   the path is in curly braces then extracted to be: "/...New Title.mp4"
      //   without the path is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application."
      // }
      const output = data.toString().replace(/{(.*?)}/, '').slice(0, -2);
      const outputVideoPath = data.toString().match(/{(.*?)}/) ? data.toString().match(/{(.*?)}/)[1] : '';
      const bodyObj = {
        videoPath: outputVideoPath,
        title: moment().format('MM-DD-yyyy') + ' ' + title,
        description: description ? description : ''
      };
      // http://localhost:5000/vimeo
      axios.post('http://localhost:5000/vimeo', bodyObj).then((response) => {
        res.status(200).send({ output: output, path: outputVideoPath, uri: response.data });
      }).catch(err => {
        console.log('err', err);
        res.sendStatus(500);
      });
      // res.sendStatus(200)
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

router.get('/file-picker', (req, res) => {
  // TODO Handle error correctly.
  const pyProcess = spawn('python3', ['server/dependencies/file_picker.py']);
  pyProcess.stdout.on('data', (data) => {
    res.status(200).send(data.toString().slice(0, -1));
  });
  // res.sendStatus(200)
  pyProcess.stderr.on('data', (data) => {
    console.log(data.toString());
    res.status(500).send({ output: data.toString() });
  });
});

module.exports = router;
