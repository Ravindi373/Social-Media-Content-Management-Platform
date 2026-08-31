const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsentLog = sequelize.define('ConsentLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id: { type: DataTypes.INTEGER, allowNull: true },
  guest_name: { type: DataTypes.STRING, allowNull: true },
  consent_given: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'consent_logs',
  timestamps: true,
});

module.exports = ConsentLog;
