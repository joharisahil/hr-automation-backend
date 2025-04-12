const express = require('express');
const dotenv = require('dotenv');
const dotenv = require('dotenv').config();
const sequelize = require('./config/db');
const authRoutes = require('./login/routes/authRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// DB connection
sequelize.sync({ force: true })

    .then(() => console.log("MySQL connected and models synced"))
    .catch(err => console.log("DB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


