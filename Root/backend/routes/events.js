const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { 
  getEvents, 
  getEventById, 
  registerEvent, 
  cancelRegistration, 
  getEventQR,
  getParticipants 
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:maSK/qr', auth, getEventQR);
router.get('/:maSK/participants', auth, getParticipants); // Route mới cho admin
router.post('/:maSK/register', auth, registerEvent);
router.delete('/:maSK/register', auth, cancelRegistration);
router.get('/:maSK', optionalAuth, getEventById);

module.exports = router;
