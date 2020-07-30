const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // const videoTitle = req.body.videoTitle;
  res.sendStatus(200);
});

module.exports = router;
