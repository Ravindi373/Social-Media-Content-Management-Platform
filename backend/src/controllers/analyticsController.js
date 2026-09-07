const { Analytics, Post, Campaign } = require('../models');
const { Sequelize, fn, col } = require('sequelize');

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
      [fn('SUM', col('likes')), 'totalLikes'],
      [fn('SUM', col('shares')), 'totalShares'],
      [fn('SUM', col('comments')), 'totalComments'],
      [fn('SUM', col('reach')), 'totalReach'],
    ],
    raw: true,
  });

  const publishedPostCount = await Post.count({ where: { status: 'published' } });
  const likes = Number(totals.totalLikes) || 0;
  const shares = Number(totals.totalShares) || 0;
  const comments = Number(totals.totalComments) || 0;
  const reach = Number(totals.totalReach) || 0;

  res.json({
    posts: publishedPostCount,
    likes,
    shares,
    comments,
    reach,
    // Engagement rate: interactions as a percentage of total reach.
    engagementRate: reach > 0 ? Math.round(((likes + shares + comments) / reach) * 10000) / 100 : 0,
  });
}

// GET /api/analytics/trend  (all roles)
// Daily totals across all analytics rows — powers the "reach over time" line
// chart. Real seed data includes several days of history so this is a
// genuine trend, not a single flat point.
async function trend(req, res) {
  const rows = await Analytics.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'day'],
      [fn('SUM', col('reach')), 'reach'],
      [fn('SUM', col('likes')), 'likes'],
      [fn('SUM', col('shares')), 'shares'],
      [fn('SUM', col('comments')), 'comments'],
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true,
  });

  res.json(rows.map((r) => ({
    day: r.day,
    reach: Number(r.reach),
    likes: Number(r.likes),
    shares: Number(r.shares),
    comments: Number(r.comments),
  })));
}

// GET /api/analytics/top-posts  (all roles)
// Ranks posts by total reach and computes an engagement rate for each —
// the "which content is actually working" view.
async function topPosts(req, res) {
  const posts = await Post.findAll({ include: [{ model: Analytics, as: 'analytics' }] });

  const ranked = posts
    .map((p) => {
      const totals = p.analytics.reduce(
        (acc, a) => {
          acc.reach += a.reach;
          acc.likes += a.likes;
          acc.shares += a.shares;
          acc.comments += a.comments;
          return acc;
        },
        { reach: 0, likes: 0, shares: 0, comments: 0 }
      );
      const engagementRate = totals.reach > 0
        ? Math.round(((totals.likes + totals.shares + totals.comments) / totals.reach) * 10000) / 100
        : 0;
      return { id: p.id, caption: p.caption, platforms: p.platforms, ...totals, engagementRate };
    })
    .filter((p) => p.reach > 0)
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);

  res.json(ranked);
}

// GET /api/analytics/by-campaign  (all roles)
// Aggregates reach/likes/shares/comments across all posts in each campaign,
// including a "No campaign" bucket for standalone posts.
async function byCampaign(req, res) {
  const posts = await Post.findAll({
    include: [
      { model: Analytics, as: 'analytics' },
      { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
    ],
  });

  const grouped = {};
  posts.forEach((p) => {
    const key = p.campaign ? p.campaign.name : 'No campaign';
    if (!grouped[key]) grouped[key] = { campaign: key, reach: 0, likes: 0, shares: 0, comments: 0 };
    p.analytics.forEach((a) => {
      grouped[key].reach += a.reach;
      grouped[key].likes += a.likes;
      grouped[key].shares += a.shares;
      grouped[key].comments += a.comments;
    });
  });

  res.json(Object.values(grouped).filter((c) => c.reach > 0));
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

module.exports = { listAnalytics, summary, trend, topPosts, byCampaign, recordAnalytics };
