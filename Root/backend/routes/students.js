const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getMyEvents } = require('../controllers/studentController');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { getMyClubs, getMyClubRequests } = require('../controllers/clubController');

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.get('/me/events', auth, getMyEvents);
router.get('/me/clubs', auth, getMyClubs);
router.get('/me/club-requests', auth, getMyClubRequests);

module.exports = router;
