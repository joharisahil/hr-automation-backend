const db = require("../config/db");

exports.insertOtp = (userId, otp, expiresAt, isNewUser) =>
  db.query(
    "INSERT INTO otp (user_id, otp_code, expires_at, used, is_new_user) VALUES (?, ?, ?, 0, ?)",
    [userId, otp, expiresAt, isNewUser]
  );

exports.getLatestUnusedOtp = (userId) =>
  db.query(
    "SELECT * FROM otp WHERE user_id = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

exports.markOtpUsed = (otpId) =>
  db.query("UPDATE otp SET used = 1 WHERE otp_id = ?", [otpId]);

exports.deleteOtpsByUserId = (userId) =>
  db.query("DELETE FROM otp WHERE user_id = ?", [userId]);
