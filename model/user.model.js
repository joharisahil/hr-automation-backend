const db = require("../config/db");

exports.findUserByPhone = (phone_no) =>
  db.query("SELECT * FROM users WHERE phone_no = ?", [phone_no]);

exports.createUser = (phone_no, name) =>
  db.query("INSERT INTO users (phone_no, name) VALUES (?, ?)", [phone_no, name]);

exports.findUserById = (user_id) =>
  db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);

exports.deleteUserById = (user_id) =>
  db.query("DELETE FROM users WHERE user_id = ?", [user_id]);

exports.updateUserTokens = (firebase_token, device_token, user_id) =>
  db.query(
    "UPDATE users SET firebase_token = ?, device_token = ? WHERE user_id = ?",
    [firebase_token, device_token, user_id]
  );
