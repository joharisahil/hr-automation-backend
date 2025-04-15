const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
const User = require('../models/userModel');
const { Op } = require('sequelize');


exports.register = async (req, res) => {
    const { email, phone, password } = req.body;

    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            }
        });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, phone, password: hashedPassword });

        res.status(201).json({ msg: 'User registered', user: newUser });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    const { loginMethod, value, password } = req.body;

    try {
        const user = await User.findOne({
            where: loginMethod === 'email' ? { email: value } : { phone: value }
        });

        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });
       
        // console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

