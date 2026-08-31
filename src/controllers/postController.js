const { Post, User, Campaign, Approval } = require('../models');

// GET /api/posts?status=draft|scheduled|published...
async function listPosts(req, res) {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const posts = await Post.findAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(posts);
}

// GET /api/posts/:id
async function getPost(req, res) {
  const post = await Post.findByPk(req.params.id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
      { model: Approval, as: 'approvalHistory' },
    ],
  });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
}

// POST /api/posts  (Administrator, Content Creator)
// Creates a post. status defaults to 'draft' unless submit=true is sent,
// in which case it goes straight to 'pending_approval'.
async function createPost(req, res) {
  try {
    const { caption, image_url, hashtags, platforms, campaign_id, submit } = req.body;
    if (!caption) return res.status(400).json({ message: 'caption is required' });

    const post = await Post.create({
      caption,
      image_url,
      hashtags,
      platforms,
      campaign_id: campaign_id || null,
      created_by: req.user.id,
      status: submit ? 'pending_approval' : 'draft',
    });

    if (submit) {
      await Approval.create({ post_id: post.id, status: 'pending' });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: 'Could not create post', error: err.message });
  }
}

// PUT /api/posts/:id  (Administrator, or the Content Creator who owns the draft)
async function updatePost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const isOwner = post.created_by === req.user.id;
  const isAdmin = req.user.role === 'Administrator';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'You can only edit your own posts' });
  }
  if (post.status !== 'draft' && post.status !== 'rejected' && !isAdmin) {
    return res.status(400).json({ message: 'Only draft or rejected posts can be edited' });
  }

  const { caption, image_url, hashtags, platforms, campaign_id } = req.body;
  await post.update({ caption, image_url, hashtags, platforms, campaign_id });
  res.json(post);
}

// POST /api/posts/:id/submit  (Administrator, Content Creator)
// Moves a draft into the approval queue.
async function submitForApproval(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.status !== 'draft' && post.status !== 'rejected') {
    return res.status(400).json({ message: 'Only draft or rejected posts can be submitted for approval' });
  }

  await post.update({ status: 'pending_approval' });
  await Approval.create({ post_id: post.id, status: 'pending' });
  res.json(post);
}

// POST /api/posts/:id/schedule  (Administrator, Content Creator)
// An approved post is given a date/time and moved to 'scheduled'.
async function schedulePost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.status !== 'approved') {
    return res.status(400).json({ message: 'Only approved posts can be scheduled' });
  }

  const { scheduled_date, scheduled_time } = req.body;
  if (!scheduled_date || !scheduled_time) {
    return res.status(400).json({ message: 'scheduled_date and scheduled_time are required' });
  }

  await post.update({ status: 'scheduled', scheduled_date, scheduled_time });
  res.json(post);
}

// DELETE /api/posts/:id  (Administrator, or owning Content Creator on a draft)
async function deletePost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const isOwner = post.created_by === req.user.id;
  const isAdmin = req.user.role === 'Administrator';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  await post.destroy();
  res.json({ message: 'Post deleted' });
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  submitForApproval,
  schedulePost,
  deletePost,
};
