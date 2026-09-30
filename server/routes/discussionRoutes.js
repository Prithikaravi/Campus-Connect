const router = require('express').Router();
const c = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.listPosts);
router.post('/', c.createPost);
router.delete('/comments/:commentId', c.deleteComment);
router.get('/:id', c.getPost);
router.put('/:id', c.updatePost);
router.delete('/:id', c.deletePost);
router.post('/:id/like', c.toggleLike);
router.post('/:id/report', c.reportPost);
router.get('/:id/comments', c.listComments);
router.post('/:id/comments', c.addComment);

module.exports = router;
