const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({user_id,phone_no,name,firebase_token,device_token}, expiresIn = "3d") => {
  const token = jwt.sign({user_id,phone_no,name,firebase_token,device_token}, process.env.JWT_SECRET, { expiresIn });

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return { token, expiresAt };
};

module.exports = { generateToken };


// otp only one  time 
