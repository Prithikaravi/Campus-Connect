const router = require('express').Router();
const c = require('../controllers/eventController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const organizers = authorize('FACULTY', 'CLUB', 'ADMIN');

// public (extra info when logged in)
router.get('/', optionalAuth, c.listEvents);
router.get('/registered/me', protect, c.myRegisteredEvents);
router.get('/:id', optionalAuth, c.getEvent);

// protected
router.post('/', protect, organizers, c.createEvent);
router.put('/:id', protect, organizers, c.updateEvent);
router.delete('/:id', protect, organizers, c.deleteEvent);

router.post('/:id/register', protect, authorize('STUDENT', 'FACULTY'), c.registerForEvent);
router.delete('/:id/register', protect, c.cancelRegistration);
router.get('/:id/registrations', protect, c.eventRegistrations);
router.post('/:id/remind', protect, organizers, c.sendReminder);
router.post('/:id/feedback', protect, c.submitFeedback);
router.get('/:id/feedback', protect, c.listFeedback);

module.exports = router;
