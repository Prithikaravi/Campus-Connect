const DiscussionPost = require('../models/DiscussionPost');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const escapeRegex = require('../utils/escapeRegex');

const shape = (post, userId) => {
  const p = post.toObject ? post.toObject() : post;
  p.likesCount = (p.likes || []).length;
  p.liked = userId ? (p.likes || []).some((id) => String(id) === String(userId)) : false;
  p.reportsCount = (p.reports || []).length;
  delete p.likes;
  delete p.reports;
  return p;
};

// GET /api/discussions ?q=&category=&sort=popular|latest&reported=true
exports.listPosts = asyncHandler(async (req, res) => {
  const { q, category, sort, reported } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { content: rx }];
  }
  if (reported === 'true' && req.user.role === 'ADMIN') filter['reports.0'] = { $exists: true };
  let posts = await DiscussionPost.find(filter).populate('author', 'name role avatar department').sort({ createdAt: -1 }).limit(100);
  posts = posts.map((p) => shape(p, req.user._id));
  if (sort === 'popular') posts.sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount));
  res.json(posts);
});

// GET /api/discussions/:id
exports.getPost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id).populate('author', 'name role avatar department');
  if (!post) throw fail(res, 404, 'Post not found');
  const comments = await Comment.find({ post: post._id }).populate('author', 'name role avatar').sort({ createdAt: 1 });
  res.json({ ...shape(post, req.user._id), comments });
});

// POST /api/discussions
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) throw fail(res, 400, 'Title and content are required');
  const post = await DiscussionPost.create({ title, content, category, author: req.user._id });
  res.status(201).json(shape(await post.populate('author', 'name role avatar department'), req.user._id));
});

// PUT /api/discussions/:id  (author only)
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw fail(res, 404, 'Post not found');
  if (String(post.author) !== String(req.user._id)) throw fail(res, 403, 'You can only edit your own posts');
  ['title', 'content', 'category'].forEach((f) => { if (req.body[f] !== undefined) post[f] = req.body[f]; });
  await post.save();
  res.json(shape(await post.populate('author', 'name role avatar department'), req.user._id));
});

// DELETE /api/discussions/:id  (author or ADMIN)
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw fail(res, 404, 'Post not found');
  if (req.user.role !== 'ADMIN' && String(post.author) !== String(req.user._id)) throw fail(res, 403, 'Access denied');
  await Promise.all([Comment.deleteMany({ post: post._id }), post.deleteOne()]);
  res.json({ message: 'Post deleted' });
});

// POST /api/discussions/:id/like  (toggle)
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw fail(res, 404, 'Post not found');
  const liked = post.likes.some((id) => String(id) === String(req.user._id));
  if (liked) post.likes.pull(req.user._id);
  else post.likes.push(req.user._id);
  await post.save();
  res.json({ liked: !liked, likesCount: post.likes.length });
});

// POST /api/discussions/:id/report
exports.reportPost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw fail(res, 404, 'Post not found');
  if (!post.reports.some((id) => String(id) === String(req.user._id))) {
    post.reports.push(req.user._id);
    await post.save();
  }
  res.json({ message: 'Post reported to moderators' });
});

// GET /api/discussions/:id/comments
exports.listComments = asyncHandler(async (req, res) => {
  res.json(await Comment.find({ post: req.params.id }).populate('author', 'name role avatar').sort({ createdAt: 1 }));
});

// POST /api/discussions/:id/comments
exports.addComment = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw fail(res, 404, 'Post not found');
  if (!req.body.content || !req.body.content.trim()) throw fail(res, 400, 'Comment cannot be empty');
  const c = await Comment.create({ post: post._id, author: req.user._id, content: req.body.content.trim() });
  await DiscussionPost.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
  res.status(201).json(await c.populate('author', 'name role avatar'));
});

// DELETE /api/discussions/comments/:commentId  (author or ADMIN)
exports.deleteComment = asyncHandler(async (req, res) => {
  const c = await Comment.findById(req.params.commentId);
  if (!c) throw fail(res, 404, 'Comment not found');
  if (req.user.role !== 'ADMIN' && String(c.author) !== String(req.user._id)) throw fail(res, 403, 'Access denied');
  await c.deleteOne();
  await DiscussionPost.updateOne({ _id: c.post, commentsCount: { $gt: 0 } }, { $inc: { commentsCount: -1 } });
  res.json({ message: 'Comment deleted' });
});
