const { Post, User, Campaign, Approval } = require('../models');
const { publishToFacebook, isConfigured } = require('../services/facebookService');
const aiCaptionService = require('../services/aiCaptionService');

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

// POST /api/posts/:id/publish  (Administrator, Content Creator)
// Pushes a scheduled (or approved) post live via the Meta Graph API.
// Falls back to a simulated publish if Facebook credentials aren't
// configured, so the flow still demonstrates end-to-end without a
// real developer app on hand — see services/facebookService.js.
async function publishPost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (!['approved', 'scheduled'].includes(post.status)) {
    return res.status(400).json({ message: 'Only approved or scheduled posts can be published' });
  }

  try {
    const result = await publishToFacebook({
      caption: post.caption,
      imageUrl: post.image_url && post.image_url.startsWith('http') ? post.image_url : null,
    });

    await post.update({
      status: 'published',
      external_post_id: result.externalPostId,
    });

    res.json({
      post,
      simulated: result.simulated,
      message: result.simulated
        ? 'Facebook credentials are not configured, so this was simulated rather than posted live. See backend/README.md to connect a real Facebook Page.'
        : 'Published live to Facebook.',
    });
  } catch (err) {
    res.status(502).json({ message: 'Could not publish to Facebook', error: err.message });
  }
}

// POST /api/posts/generate-caption  (Administrator, Content Creator)
// AI-assisted caption + hashtag generation, bonus feature.
// body: { topic, platform, tone }
async function generateCaption(req, res) {
  try {
    const { topic, platform, tone } = req.body;
    const result = await aiCaptionService.generateCaption({ topic, platform, tone });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: 'Could not generate caption', error: err.message });
  }
}

// GET /api/posts/integration-status  (any authenticated user)
// Lets the frontend show whether it's hitting the real Graph API or simulating.
function integrationStatus(req, res) {
  res.json({
    facebookConfigured: isConfigured(),
    aiCaptionConfigured: aiCaptionService.isConfigured(),
  });
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
  publishPost,
  generateCaption,
  integrationStatus,
  deletePost,
};
