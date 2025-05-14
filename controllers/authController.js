const db = require("../config/db");
const { generateToken } = require("../utils/token");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup + Send OTP
exports.signuplog = async (req, res) => {
  const { phone_no, name, firebase_token,device_token } = req.body;

  const [user] = await db.query("SELECT * FROM users WHERE phone_no = ?", [phone_no]);

  let userId;

  if (user.length > 0) {
    // Existing user
    userId = user[0].user_id;
  } else {
    // New user, name required
    if (!name) return res.status(400).send("Name is required for new users");
    const result = await db.query("INSERT INTO users (phone_no, name) VALUES (?, ?, ?,?)", [phone_no, name,firebase_token,device_token]);
    userId = result[0].insertId;
  }

  // Generate and save OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

  await db.query(
    "INSERT INTO otp (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
    [userId, otp, expiresAt]
  );

  console.log(`OTP for ${phone_no}: ${otp}`);
  res.send("OTP sent. Please verify.");
};// OTP Verification - Final Login


exports.verifyOtp = async (req, res) => {
  const { phone_no, otp_code,firebase_token,device_token } = req.body;
  let firebaseToken,deviceToken;

  const [user] = await db.query("SELECT * FROM users WHERE phone_no = ?", [phone_no]);
  if (user.length === 0) return res.status(404).send("User not found");
  else{
    firebaseToken = user[0].firebase_token;
    deviceToken = user[0].device_token;
  }


  const [otpData] = await db.query(
    "SELECT * FROM otp WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [user[0].user_id]
  );
 

  if (
    !otpData.length ||
    otpData[0].otp_code !== otp_code ||
    new Date(otpData[0].expires_at) < new Date()|| firebaseToken !== firebase_token || deviceToken !== device_token
  ) {
    return res.status(401).send("Invalid or expired OTP");
  }

  const { token, expiresAt } = generateToken({ user_id: user[0].user_id,
    phone_no: user[0].phone_no,
    name: user[0].name,
    firebase_token:firebase_token,
    device_token:device_token
   }, "3d");

  await db.query(
    "INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [user[0].user_id, token, expiresAt]
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000,s
  });

  res.send("OTP verified and logged in");
};

// Resend OTP
// exports.resendOtp = async (req, res) => {
//   const { phone_no } = req.body;
//   const [user] = await db.query("SELECT * FROM users WHERE phone_no = ?", [phone_no]);
//   if (user.length === 0) return res.status(404).send("User not found");

//   const otp = generateOTP();
//   const expiresAt = new Date(Date.now() + 5 * 60000);

//   await db.query(
//     "INSERT INTO otp (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
//     [user[0].user_id, otp, expiresAt]
//   );

//   console.log(`Resent OTP for ${phone_no}: ${otp}`);
//   res.send("OTP resent");
// };

// Logout
exports.logout = async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    await db.query("DELETE FROM tokens WHERE token = ?", [token]);
    res.clearCookie("token");
  }
  res.send("Logged out");
};

// Check Authentication
exports.checkAuth = async (req, res) => {
  try {
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [req.userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: user[0] });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
