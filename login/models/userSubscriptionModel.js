const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./userModel');

const UserSubscription = sequelize.define('UserSubscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  subscriptionLevel: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.hasOne(UserSubscription, { foreignKey: 'id' });
UserSubscription.belongsTo(User, { foreignKey: 'id' });

module.exports = UserSubscription;
