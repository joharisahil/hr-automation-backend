const { findUserById } = require("../../model/user.model");

exports.checkAuth = async (req, res) => {
  const [user] = await findUserById(req.userId);
  if (user.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, user: user[0] });
};
