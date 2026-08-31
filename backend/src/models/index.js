const sequelize = require('../config/database');
const User = require('./user');
const Campaign = require('./campaign');
const Post = require('./post');
const Approval = require('./approval');
const Analytics = require('./analytics');
const ConsentLog = require('./consentLog');

// ---- Associations (mirrors the ERD) ----

// User 1:N Post (author)
User.hasMany(Post, { foreignKey: 'created_by', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// User 1:N Approval (approver)
User.hasMany(Approval, { foreignKey: 'approver_id', as: 'approvals' });
Approval.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// Campaign 1:N Post
Campaign.hasMany(Post, { foreignKey: 'campaign_id', as: 'posts' });
Post.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

// Post 1:N Approval (revision history)
Post.hasMany(Approval, { foreignKey: 'post_id', as: 'approvalHistory' });
Approval.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Post 1:N Analytics (one row per platform)
Post.hasMany(Analytics, { foreignKey: 'post_id', as: 'analytics' });
Analytics.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Post 1:N ConsentLog
Post.hasMany(ConsentLog, { foreignKey: 'post_id', as: 'consentLogs' });
ConsentLog.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

module.exports = {
  sequelize,
  User,
  Campaign,
  Post,
  Approval,
  Analytics,
  ConsentLog,
};
