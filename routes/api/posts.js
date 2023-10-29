const express = require('express');
const router = express.Router();

// @route FET api/posts/test
//@desc Test posts routes
//@acces Public
router.get('/test', (req, res) => res.json({msg: 'test'}));

module.exports = router;