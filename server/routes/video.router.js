const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const os = require('os');

let invalidCharactersArrayPlatformSpecific = [];
if (os.platform() === 'darwin' || os.platform() === 'linux') {
  invalidCharactersArrayPlatformSpecific = ['/'];
} else if (os.platform() === 'win32') {
  invalidCharactersArrayPlatformSpecific = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
}

// Confirm the input environment variable isn't undefined.
router.get('/invalid-filename-character-array', (req, res) => {
  res.status(200).send(invalidCharactersArrayPlatformSpecific);
});

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

router.get('/verify-output-path', (req, res) => {
  const path = 'MAIN_OUTPUT_FOLDER';
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

router.get('/check-separate-audio-only', (req, res) => {
  const keyword = 'SEPARATE_AUDIO_ONLY_FILE_OPTION';
  try {
    if (process.env[keyword] === 'true') {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch {
    res.sendStatus(500);
  }
});

router.get('/invalid-filename-replacement-character', (req, res) => {
  const keyword = 'REPLACE_INVALID_FILENAME_CHARACTERS_WITH';
  try {
    if (process.env[keyword]) {
      res.status(200).send(process.env[keyword]);
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
  const trimStart = req.body.trimStart || '';
  const trimEnd = req.body.trimEnd || '';
  const codecCopy = process.env.TRIM_CODEC_COPY || true;
  const specifyPixelFormat = process.env.SPECIFY_PIXEL_FORMAT || false;
  const compressionSpeedPreset = process.env.COMPRESSION_SPEED_PRESET || 'fast';
  const outputExtension = process.env.OUTPUT_EXTENSION || '.mp4';
  const renameInputFile = process.env.RENAME_INPUT_VIDEO || true;
  const characterToReplaceInvalidFilenameCharactersWith = req.body.characterToReplaceInvalidFilenameCharactersWith;
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
        specifyPixelFormat,
        compressionSpeedPreset,
        outputExtension,
        renameInputFile,
        invalidCharactersArrayPlatformSpecific.join(''),
        characterToReplaceInvalidFilenameCharactersWith
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
        res.status(500).send(pythonErr);
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
    !pythonErr && res.status(200).send(String(data.toString()));
  });
});

router.get('/exit-process', (req, res) => {
  // The application success fully uploaded the video(s) so kill this process.
  if (os.platform() === 'darwin') {
    try {
      spawn('killall', ['node']);
      res.sendStatus(200);
    } catch (error) {
      console.log('killall error', error);
      res.sendStatus(500);
    }
  } else if (os.platform() === 'win32') {
    try {
      spawn('taskkill', ['/IM', 'node.exe', '/F']);
      res.sendStatus(200);
    } catch (error) {
      console.log('taskkill error', error);
      res.sendStatus(500);
    }
  }
  // process.kill(process.ppid);
});

module.exports = router;
