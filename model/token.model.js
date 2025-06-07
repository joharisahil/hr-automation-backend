const db = require("../config/db");

exports.insertToken = (userId, token, expiresAt) =>
  db.query(
    "INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

exports.deleteToken = (token) =>
  db.query("DELETE FROM tokens WHERE token = ?", [token]);
