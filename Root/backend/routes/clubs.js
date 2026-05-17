const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllClubs, getClubById, joinClub } = require('../controllers/clubController');

router.get('/', auth, getAllClubs);
router.get('/:id', auth, getClubById);
router.post('/:id/join', auth, joinClub);

module.exports = router;
