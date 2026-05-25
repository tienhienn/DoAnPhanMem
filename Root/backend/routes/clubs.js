const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const { getAllClubs, getClubById, joinClub, leaveClub } = require('../controllers/clubController');
const {
  getUnits,
  registerClub,
  getMyRegistrations,
  getRegistrations,
  reviewRegistration
} = require('../controllers/clubRegistrationController');

// --- Đăng ký mở CLB trực tuyến ---
router.get('/units', auth, getUnits);
router.post('/register', auth, registerClub);
router.get('/my-registrations', auth, getMyRegistrations);

// --- Phê duyệt mở CLB (Khoa/CTSV) ---
router.get('/admin/registrations', auth, authorizeRole(['KHOA', 'CTSV']), getRegistrations);
router.patch('/admin/registrations/:id/review', auth, authorizeRole(['KHOA', 'CTSV']), reviewRegistration);

// --- Quản lý & thành viên CLB ---
router.get('/', auth, getAllClubs);
router.get('/:id', auth, getClubById);
router.post('/:id/join', auth, joinClub);
router.post('/:id/leave', auth, leaveClub);

module.exports = router;
