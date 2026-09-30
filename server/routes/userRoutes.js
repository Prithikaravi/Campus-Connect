const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/me', c.getMyProfile);
router.put('/me', c.updateMyProfile);
router.put('/me/password', c.changePassword);

router.get('/', authorize('ADMIN', 'FACULTY'), c.listUsers);
router.get('/:id', c.getUser);
router.put('/:id/role', authorize('ADMIN'), c.updateRole);
router.patch('/:id/status', authorize('ADMIN'), c.setStatus);
router.delete('/:id', authorize('ADMIN'), c.deleteUser);

module.exports = router;
