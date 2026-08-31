const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM('New Product Launch', 'Awareness Campaign', 'Event Promotion'),
    allowNull: false,
  },
  objective: { type: DataTypes.STRING, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: 'campaigns',
  timestamps: true,
});

module.exports = Campaign;
