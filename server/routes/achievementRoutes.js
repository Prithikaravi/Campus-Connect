const router = require('express').Router();
const c = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', c.listMine);
router.get('/user/:userId', authorize('FACULTY', 'ADMIN'), c.listForUser);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
