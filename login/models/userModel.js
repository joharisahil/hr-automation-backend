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
        allowNull: true // Allow null for Google users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    }
    
});

module.exports = User;
