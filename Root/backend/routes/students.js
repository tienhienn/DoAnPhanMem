const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getMyEvents } = require('../controllers/studentController');

router.get('/me/events', auth, getMyEvents);

module.exports = router;
