const express = require('express');
const router = express.Router();
const app = express();
const PORT = process.env.PORT || 5000;

router.post('/', (req, res) => {
  const userName = req.body.userName;
  const videoTitle = req.body.videoTitle;
  if (userName !== undefined) {
    const pyProcess = spawn('python3', ['local_operations.py', userName, videoTitle]);
    pyProcess.stdout.on('data', (data) => {
      res.status(200).send({ output: data.toString() });
    });
  } else {
    console.log("Error that's an invalid user.");
    res.sendStatus(500);
  }
});

// Start listening for requests on a specific port.
app.listen(PORT, () => {
  console.log('Running on port', PORT);
});

module.exports = router;
