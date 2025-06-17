// for sending request..........
exports.getPendingRequests = async (req, res) => {
  const leaderId = req.userId;

  try {
    const [rows] = await db.query(`
      SELECT om.member_id, u.name, u.phone_no, o.org_name, om.joined_date
      FROM org_members om
      JOIN users u ON om.member_id = u.id
      JOIN organization o ON om.org_id = o.org_id
      WHERE om.leader_id = ? AND om.status = 'pending'
    `, [leaderId]);

    res.status(200).json({ success: true, pendingRequests: rows });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// from here extract the pending req as well as member_id and then send on the url