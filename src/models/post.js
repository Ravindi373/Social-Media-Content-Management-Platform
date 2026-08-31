const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  campaign_id: { type: DataTypes.INTEGER, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  caption: { type: DataTypes.TEXT, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: true },
  // Comma-separated for prototype simplicity, e.g. "#SereneBay,#SundayBrunch"
  hashtags: { type: DataTypes.STRING, allowNull: true },
  // Comma-separated for prototype simplicity, e.g. "Instagram,Facebook"
  platforms: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'rejected'),
    allowNull: false,
    defaultValue: 'draft',
  },
  scheduled_date: { type: DataTypes.DATEONLY, allowNull: true },
  scheduled_time: { type: DataTypes.TIME, allowNull: true },
}, {
  tableName: 'posts',
  timestamps: true,
});

module.exports = Post;
