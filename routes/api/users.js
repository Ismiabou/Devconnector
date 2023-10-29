const express = require('express');
const router = express.Router();

// @route FET api/users/test
//@desc Test users routes
//@acces Public
router.get('/test', (req, res) => res.json({msg: 'test'}));

module.exports = router;