/* eslint-disable no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable no-negated-condition */
/* eslint-disable require-unicode-regexp */
/* eslint-disable prefer-named-capture-group */
/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const os = require('os');

let invalidCharactersArrayPlatformSpecific = [];
if (os.platform() === 'darwin' || os.platform() === 'linux') {
  invalidCharactersArrayPlatformSpecific = ['/'];
} else if (os.platform() === 'win32') {
  invalidCharactersArrayPlatformSpecific = [
    '\\',
    '/',
    ':',
    '*',
    '?',
    '"',
    '<',
    '>',
    '|'
  ];
}

const httpStatsCodes = {
  ok: 200,
  noContent: 204,
  internalServerError: 500
};

// Confirm the input environment variable isn't undefined.
router.get('/invalid-filename-character-array', (req, res) => {
  res.status(httpStatsCodes.ok).send(invalidCharactersArrayPlatformSpecific);
});

// Confirm the input environment variable isn't undefined.
router.get('/users', (req, res) => {
  const users = 'USERS';
  try {
    // eslint-disable-next-line no-undefined
    if (process.env[users] === undefined) {
      res.sendStatus(httpStatsCodes.noContent);
    } else {
      res.status(httpStatsCodes.ok).send(process.env[users]);
    }
  } catch {
    res.sendStatus(httpStatsCodes.internalServerError);
  }
});

router.get('/verify-output-path', (req, res) => {
  const path = 'MAIN_OUTPUT_FOLDER';
  try {
    // eslint-disable-next-line no-undefined
    if (process.env[path] === undefined) {
      res.status(httpStatsCodes.ok).send(`Heads up! The main output path ${path} is undefined so this will application will fail to run until that's been specified.`);
    } else {
      res.status(httpStatsCodes.ok).send('');
    }
  } catch {
    res.sendStatus(httpStatsCodes.internalServerError);
  }
});

router.get('/check-separate-audio-only', (req, res) => {
  const keyword = 'SEPARATE_AUDIO_ONLY_FILE_OPTION';
  try {
    if (process.env[keyword] === 'true') {
      res.status(httpStatsCodes.ok).send(true);
    } else {
      res.status(httpStatsCodes.ok).send(false);
    }
  } catch {
    res.sendStatus(httpStatsCodes.internalServerError);
  }
});

router.get('/invalid-filename-replacement-character', (req, res) => {
  const keyword = 'REPLACE_INVALID_FILENAME_CHARACTERS_WITH';
  try {
    if (process.env[keyword]) {
      res.status(httpStatsCodes.ok).send(process.env[keyword]);
    } else {
      res.status(httpStatsCodes.ok).send('');
    }
  } catch {
    res.sendStatus(httpStatsCodes.internalServerError);
  }
});

router.post('/', (req, res) => {
  const mainOutputFolder = process.env.MAIN_OUTPUT_FOLDER;
  const { videoPath } = req.body;
  const { title } = req.body;
  const { userName } = req.body;
  const exportSeparateAudio = String(req.body.exportSeparateAudio);
  const compress = process.env.COMPRESSION || false;
  const trimStart = req.body.trimStart || '';
  const trimEnd = req.body.trimEnd || '';
  const codecCopy = process.env.TRIM_CODEC_COPY || true;
  const specifyPixelFormat = process.env.SPECIFY_PIXEL_FORMAT || false;
  const compressionSpeedPreset = process.env.COMPRESSION_SPEED_PRESET || 'fast';
  const outputExtension = process.env.OUTPUT_EXTENSION || '.mp4';
  const renameInputFile = process.env.RENAME_INPUT_VIDEO || true;
  const { characterToReplaceInvalidFilenameCharactersWith } = req.body;
  const description = req.body.description || '';

  // The python process will change these values as it goes through but define
  // default values them here due to scoping.
  let pythonErr = '';
  let output = '';
  let outputVideoPath = '';
  let bodyObj = {};

  // Run the python file from the command line and pass it these arguments:
  // eslint-disable-next-line no-unused-vars
  const promise = new Promise((resolve, reject) => {
    const pyProcess = spawn('python3', [
      'server/dependencies/local_operations.py',
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
        output = data.toString().replace(/{(.*?)}/, '')
          .replace(/{{(.*?)}}/, '')
          .slice(0, -2);
        outputVideoPath = data.toString().match(/{(.*?)}/)
          ? data.toString().match(/{(.*?)}/)[1]
          : '';
        bodyObj = {
          videoPath: outputVideoPath,
          title,
          description
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
        res.status(httpStatsCodes.internalServerError).send(pythonErr);
      } else {
        res.status(httpStatsCodes.ok).send({
          output,
          path: outputVideoPath,
          bodyObj
        });
      }
    });
  });
});

router.get('/file-picker', (req, res) => {
  // Launch the python file to open the file picker which prints the selected file to the stdout.

  // The python process will change these values as it goes through but define
  // default values them here due to scoping.
  let pythonErr = '';
  let output = '';

  // eslint-disable-next-line no-unused-vars
  const promise = new Promise((resolve, reject) => {
    const pyProcess = spawn('python3', ['server/dependencies/file_picker.py']);
    pyProcess.stdout.setEncoding('utf8');
    pyProcess.stderr.setEncoding('utf8');
    pyProcess.stdout.on('data', data => {
      output = data.toString();
    });
    // python encountered an error.
    pyProcess.stderr.on('data', data => {
      pythonErr = data;
    });
    pyProcess.on('error', error => reject(error));
    pyProcess.on('close', exitCode => {
      const ignoreErrors = 'IGNORE_FILE_SELECTION_ERRORS';
      resolve(exitCode);
      if (process.env[ignoreErrors]) {
        res.status(httpStatsCodes.ok).send(pythonErr);
      } else if (pythonErr !== '') {
        // path and bodyObj are used by the next operation so if there was an error don't include.
        res.status(httpStatsCodes.internalServerError).send({ output: pythonErr });
      } else {
        // If the user clicks the "cancel" button for the file picker it returns "."
        // so instead return an empty string to avoid a video being added with an invalid path.
        if (output === '.') {
          res.status(httpStatsCodes.ok).send('');
        } else {
          res.status(httpStatsCodes.ok).send(output);
        }
      }
    });
  });
});

router.get('/exit-process', (req, res) => {
  // The application success fully uploaded the video(s) so kill the node processes and
  // stop the sockets.
  req.io.sockets.removeListener('upload.progress', () => { });
  req.io.sockets.removeListener('upload.finish', () => { });
  if (os.platform() === 'darwin') {
    try {
      spawn('killall', ['node']);
      res.sendStatus(httpStatsCodes.ok);
    } catch (error) {
      console.log('killall error', error);
      res.sendStatus(httpStatsCodes.internalServerError);
    }
  } else if (os.platform() === 'win32') {
    try {
      [process.pid, process.ppid].map(processId => process.kill(processId));
      res.sendStatus(httpStatsCodes.ok);
    } catch (error) {
      console.log('taskkill error', error);
      res.sendStatus(httpStatsCodes.internalServerError);
    }
  }
});

module.exports = router;
