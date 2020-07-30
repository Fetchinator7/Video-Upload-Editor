const express = require('express');
const router = express.Router();

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
    res.sendStatus(400);
  }
});

module.exports = router;
