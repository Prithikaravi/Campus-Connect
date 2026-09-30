const router = require('express').Router();
const c = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/me/history', c.myAttendance);
router.get('/:eventId', authorize('FACULTY', 'CLUB', 'ADMIN'), c.getEventAttendance);
router.post('/:eventId', authorize('FACULTY', 'CLUB', 'ADMIN'), c.markAttendance);
router.delete('/:eventId/:userId', authorize('FACULTY', 'CLUB', 'ADMIN'), c.unmarkAttendance);

module.exports = router;
