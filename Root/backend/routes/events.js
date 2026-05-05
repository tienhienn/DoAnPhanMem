const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { getEvents, getEventById, registerEvent, cancelRegistration, getEventQR } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:maSK/qr', auth, getEventQR);           // phải trước /:maSK
router.post('/:maSK/register', auth, registerEvent);
router.delete('/:maSK/register', auth, cancelRegistration);
router.get('/:maSK', optionalAuth, getEventById);     // phải sau cùng

module.exports = router;
