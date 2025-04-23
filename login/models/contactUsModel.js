const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // fixed path


const ContactUs = sequelize.define('ContactUs', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'contact_us',
  timestamps: true,
});

module.exports = ContactUs;
