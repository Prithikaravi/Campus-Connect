const router = require('express').Router();
const c = require('../controllers/clubController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/', optionalAuth, c.listClubs);
router.get('/joined/me', protect, c.myClubs);
router.get('/:id', optionalAuth, c.getClub);

router.post('/', protect, authorize('CLUB', 'FACULTY', 'ADMIN'), c.createClub);
router.put('/:id', protect, authorize('CLUB', 'FACULTY', 'ADMIN'), c.updateClub);
router.delete('/:id', protect, authorize('CLUB', 'ADMIN'), c.deleteClub);

router.post('/:id/join', protect, c.joinClub);
router.delete('/:id/leave', protect, c.leaveClub);

router.get('/:id/members', protect, c.listMembers);
router.put('/:id/members/:userId', protect, c.updateMemberRole);
router.delete('/:id/members/:userId', protect, c.removeMember);
router.post('/:id/invite', protect, c.inviteUser);

router.post('/:id/activities', protect, c.addActivity);
router.delete('/:id/activities/:activityId', protect, c.deleteActivity);
router.get('/:id/analytics', protect, c.clubAnalytics);

module.exports = router;
