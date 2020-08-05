const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

const mainOutputFolder = process.env.MAIN_OUTPUT_FOLDER;

router.post('/', (req, res) => {
  const videoPath = req.body.videoPath;
  const title = req.body.title;
  const userName = req.body.userName;
  const exportSeparateAudio = req.body.exportSeparateAudio;
  const description = req.body.description;
  if (userName !== undefined) {
    // TODO Handle error correctly.
    let pythonErr = false;
    const pyProcess = spawn('python3', ['server/dependencies/local_operations.py', mainOutputFolder, videoPath, title, userName, exportSeparateAudio]);
    pyProcess.stderr.on('data', (data) => {
      console.log(data.toString());
      pythonErr = true;
      res.status(500).send({ output: data.toString() });
    });
    pyProcess.stdout.on('data', (data) => {
      // The data object is what's sent to the python console which has the messages and the
      // output path in {}:
      // {
      //   the raw output is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application.\n{/...New Title.mp4}\n"
      //   the path is in curly braces then extracted to be: "/...New Title.mp4"
      //   without the path is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application."
      // }
      const output = data.toString().replace(/{(.*?)}/, '').replace(/{{(.*?)}}/, '').slice(0, -2);
      const outputVideoPath = data.toString().match(/{(.*?)}/) ? data.toString().match(/{(.*?)}/)[1] : '';
      const bodyObj = {
        videoPath: outputVideoPath,
        title: title,
        description: description ? description : ''
      };
      // http://localhost:5000/vimeo
      !pythonErr && res.status(200).send({ output: output, path: outputVideoPath, bodyObj: bodyObj });
      // res.sendStatus(200)
    });
  } else {
    console.log("Error that's an invalid user.");
    res.sendStatus(400);
  }
});

router.get('/file-picker', (req, res) => {
  // TODO Handle error correctly.
  const pyProcess = spawn('python3', ['server/dependencies/file_picker.py']);
  pyProcess.stderr.on('data', (data) => {
    console.log(data.toString());
    res.status(500).send({ output: data.toString() });
  });
  pyProcess.stdout.on('data', (data) => {
    res.status(200).send(data.toString().slice(0, -1));
  });
});

router.get('/exit-process', (req, res) => {
  try {
    spawn('killall', ['node']);
  } catch (error) {
    console.log('killall error', error);
  }
});

module.exports = router;
