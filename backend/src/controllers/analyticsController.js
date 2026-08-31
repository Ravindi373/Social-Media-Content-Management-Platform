const { Analytics, Post } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/analytics  (all roles)
// Returns per-post analytics rows, optionally filtered by platform.
async function listAnalytics(req, res) {
  const where = {};
  if (req.query.platform) where.platform = req.query.platform;

  const analytics = await Analytics.findAll({
    where,
    include: [{ model: Post, as: 'post', attributes: ['id', 'caption', 'status'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(analytics);
}

// GET /api/analytics/summary  (all roles)
// Aggregate totals for the analytics dashboard's stat cards.
async function summary(req, res) {
  const totals = await Analytics.findOne({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('likes')), 'totalLikes'],
      [Sequelize.fn('SUM', Sequelize.col('shares')), 'totalShares'],
      [Sequelize.fn('SUM', Sequelize.col('comments')), 'totalComments'],
      [Sequelize.fn('SUM', Sequelize.col('reach')), 'totalReach'],
    ],
    raw: true,
  });

  const publishedPostCount = await Post.count({ where: { status: 'published' } });

  res.json({
    posts: publishedPostCount,
    likes: Number(totals.totalLikes) || 0,
    shares: Number(totals.totalShares) || 0,
    comments: Number(totals.totalComments) || 0,
    reach: Number(totals.totalReach) || 0,
  });
}

// POST /api/analytics  (Administrator)
// For a prototype, analytics are entered manually rather than pulled from a live API.
async function recordAnalytics(req, res) {
  try {
    const { post_id, platform, likes, shares, comments, reach } = req.body;
    if (!post_id || !platform) return res.status(400).json({ message: 'post_id and platform are required' });

    const record = await Analytics.create({ post_id, platform, likes, shares, comments, reach });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: 'Could not record analytics', error: err.message });
  }
}

module.exports = { listAnalytics, summary, recordAnalytics };
