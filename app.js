const express = require('express');
const app = express();
const sequelize = require('./config/db');
const contactRoutes = require('./login/routes/contactRoutes');
require('dotenv').config();

app.use(express.json());
app.use('/api', contactRoutes);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Connected to DB');
    return sequelize.sync(); // Create tables
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('Database connection failed:', err));
