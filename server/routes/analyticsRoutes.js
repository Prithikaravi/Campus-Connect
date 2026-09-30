const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/student', c.studentAnalytics);
router.get('/dashboard', c.studentDashboard);
router.get('/passport', c.passport);
router.get('/faculty', authorize('FACULTY', 'ADMIN'), c.facultyAnalytics);
router.get('/admin', authorize('ADMIN'), c.adminAnalytics);
router.get('/registrations', authorize('ADMIN', 'FACULTY'), c.allRegistrations);
router.get('/attendance', authorize('ADMIN', 'FACULTY'), c.allAttendance);

module.exports = router;
