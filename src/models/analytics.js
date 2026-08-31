const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  platform: { type: DataTypes.STRING, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  shares: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
  reach: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'analytics',
  timestamps: true,
});

module.exports = Analytics;
