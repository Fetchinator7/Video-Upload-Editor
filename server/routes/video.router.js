const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Confirm the input environment variable isn't undefined.
router.get('/users', (req, res) => {
  const users = 'USERS';
  try {
    if (process.env[users] === undefined) {
      res.sendStatus(204);
    } else {
      res.status(200).send(process.env[users]);
    }
  } catch {
    res.sendStatus(500);
  }
});

router.get('/verify-output-path/:path', (req, res) => {
  const path = req.params.path;
  try {
    if (process.env[path] === undefined) {
      res.status(200).send(`Heads up! The main output path ${path} is undefined so this will application will fail to run until that's been specified.`);
    } else {
      res.status(200).send('');
    }
  } catch {
    res.sendStatus(500);
  }
});

router.post('/', (req, res) => {
  const mainOutputFolder = process.env.MAIN_OUTPUT_FOLDER;
  const videoPath = req.body.videoPath;
  const title = req.body.title;
  const userName = req.body.userName;
  const exportSeparateAudio = String(req.body.exportSeparateAudio);
  const compress = process.env.COMPRESSION || false;
  const trimStart = req.body.trimStart;
  const trimEnd = req.body.trimEnd;
  const codecCopy = process.env.TRIM_CODEC_COPY || true;
  const specifyPixelFormat = process.env.SPECIFY_PIXEL_FORMAT || false;
  const description = req.body.description || '';

  // The python process will change these values as it goes through but define
  // default values them here due to scoping.
  let pythonErr = '';
  let output = '';
  let outputVideoPath = '';
  let bodyObj = {};

  // Run the python file from the command line and pass it these arguments:
  const promise = new Promise((resolve, reject) => {
    const pyProcess = spawn('python3',
      ['server/dependencies/local_operations.py',
        mainOutputFolder,
        videoPath,
        title,
        userName,
        exportSeparateAudio,
        compress,
        trimStart,
        trimEnd,
        codecCopy,
        specifyPixelFormat
      ]);

    pyProcess.stdout.setEncoding('utf8');
    pyProcess.stderr.setEncoding('utf8');
    pyProcess.stdout.on('data', data => {
      // With the way it's setup when ffmpeg encounters an error it prints "Error..." so see if the output has "Error..." in it.
      if (data.toString().includes('Error, ')) {
        pythonErr = data;
      } else {
        // It worked so it returns the command line output:
        // {
        //   the raw output is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application.\n{/...New Title.mp4}\n"
        //   the path is in {} then extracted to be: "/...New Title.mp4"
        //   without the path is: "New directory, \".../New Title\" was created!\nSession log created at \"...New Title-log.txt\"\nOpened file/folder: \"..." with the default application."
        // }
        // Since extra {} were injected to determine what the output path is remove those {} from the output message.
        output = data.toString().replace(/{(.*?)}/, '').replace(/{{(.*?)}}/, '').slice(0, -2);
        outputVideoPath = data.toString().match(/{(.*?)}/) ? data.toString().match(/{(.*?)}/)[1] : '';
        bodyObj = {
          videoPath: outputVideoPath,
          title: title,
          description: description
        };
      }
    });
    // python encountered an error.
    pyProcess.stderr.on('data', data => {
      pythonErr = data;
    });
    pyProcess.on('error', error => reject(error));
    pyProcess.on('close', exitCode => {
      resolve(exitCode);
      if (pythonErr !== '') {
        // path and bodyObj are used by the next operation so if there was an error don't include.
        res.status(500).send({ output: pythonErr });
      } else {
        res.status(200).send({ output: output, path: outputVideoPath, bodyObj: bodyObj });
      }
    });
  });
});

router.get('/file-picker', (req, res) => {
  // Launch the python file to open the file picker which prints the selected file to the stdout.
  let pythonErr = false;
  const pyProcess = spawn('python3', ['server/dependencies/file_picker.py']);
  pyProcess.stderr.on('data', (data) => {
    console.log(data.toString());
    pythonErr = true;
    res.status(500).send({ output: data.toString() });
  });
  pyProcess.stdout.on('data', (data) => {
    !pythonErr && res.status(200).send(String(data.toString().slice(0, -1)));
  });
});

router.get('/exit-process', (req, res) => {
  // The application success fully uploaded the video(s) so kill all node processes so
  // all the user has to do to use the application again is to launch the "run" file.
  try {
    spawn('killall', ['node']);
  } catch (error) {
    console.log('killall error', error);
  }
});

module.exports = router;
