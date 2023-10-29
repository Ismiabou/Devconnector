const express = require('express');
const router = express.Router();

// @route FET api/profile/test
//@desc Test profile routes
//@acces Public
router.get('/test', (req, res) => res.json({msg: 'test'}));

module.exports = router;