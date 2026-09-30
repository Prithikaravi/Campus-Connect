const router = require('express').Router();
const c = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', c.listAnnouncements);
router.post('/', authorize('FACULTY', 'CLUB', 'ADMIN'), c.createAnnouncement);
router.put('/:id', authorize('FACULTY', 'CLUB', 'ADMIN'), c.updateAnnouncement);
router.delete('/:id', authorize('FACULTY', 'CLUB', 'ADMIN'), c.deleteAnnouncement);

module.exports = router;
