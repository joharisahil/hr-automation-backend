const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, expiresIn = "3d") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return { token, expiresAt };
};

module.exports = { generateToken };
