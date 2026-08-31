const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  approver_id: { type: DataTypes.INTEGER, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  comments: { type: DataTypes.TEXT, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'approvals',
  timestamps: true,
});

module.exports = Approval;
