const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = User;
