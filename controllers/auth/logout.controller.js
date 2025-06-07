const db = require("../../config/db");
const {deleteToken} = require("../../model/token.model");

exports.logout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: "Token not found" });
  }

  await deleteToken(token);

  res.status(200).json({ message: "Logged out successfully" });
};
