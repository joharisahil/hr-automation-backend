const { generateToken } = require("../../utils/token");
const {
  getLatestUnusedOtp,
  markOtpUsed,
  deleteOtpsByUserId,
} = require("../../model/otp.model");
const {
  findUserByPhone,
  deleteUserById,
  updateUserTokens,
} = require("../../model/user.model");
const { insertToken } = require("../../model/token.model");

exports.verifyOtp = async (req, res) => {
  const { phone_no, otp_code, firebase_token, device_token } = req.body;

  // 1. Check if user exists
  const [userData] = await findUserByPhone(phone_no);
  if (userData.length === 0) return res.status(404).send("User not found");

  const user = userData[0];
  const userId = user.user_id;

  // 2. Get latest unused OTP
  const [otpData] = await getLatestUnusedOtp(userId);
  
  const otp = otpData?.[0];
  const now = new Date();

  const isExpired = !otp || new Date(otp.expires_at) < now;
  const isInvalid = otp?.otp_code !== otp_code;

  // 3. OTP validation failure
  if (!otp || isExpired || isInvalid) {
    await deleteOtpsByUserId(userId);

    if (otp?.is_new_user === 1) {
      await deleteUserById(userId);
    }

    return res.status(401).send("Invalid or expired OTP");
  }

  // 4. Update user with device & Firebase tokens
  await updateUserTokens(firebase_token, device_token, userId);

  // 5. Mark OTP as used
  await markOtpUsed(otp.otp_id);

  // 6. Generate JWT token
  const { token, expiresAt } = generateToken(
    {
      user_id: user.user_id,
      phone_no: user.phone_no,
      name: user.name,
      firebase_token,
      device_token,
    },
    "3d"
  );

  // 7. Save the token
  await insertToken(userId, token, expiresAt);

  return res.status(201).json({
    success: true,
    message: "OTP verified and logged in",
    data: { token },
  });
};
