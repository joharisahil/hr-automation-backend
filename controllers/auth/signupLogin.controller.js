const { generateOTP } = require("../../utils/otp");
const { findUserByPhone, createUser } = require("../../model/user.model");
const { insertOtp } = require("../../model/otp.model");

exports.signuplog = async (req, res) => {
  const { phone_no, name } = req.body;

  // 1. Check if user exists
  const [userData] = await findUserByPhone(phone_no);

  let userId;
  let isNewUser = false;

  if (userData.length > 0) {
    userId = userData[0].user_id;
  } else {
    // New user: name is required
    if (!name) {
      return res.status(400).send("Name is required for new users");
    }

    const result = await createUser(phone_no, name);
    userId = result[0].insertId;
    isNewUser = true;
  }

  // 2. Generate OTP and expiration
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  // 3. Store OTP in DB
  await insertOtp(userId, otp, expiresAt, isNewUser ? 1 : 0);

  // In production, send via SMS (Twilio, etc). Here, just log
  console.log(`OTP for ${phone_no}: ${otp}`);

  res.send("OTP sent. Please verify.");
};
