const { updateMemberStatus } = require("../../model/invite.model");

 exports.confirmMember = async (req, res) => {
  const { member_id } = req.params;
  const { status } = req.body; // status should be either 'accepted' or 'rejected'

  try {
    const [result] = await updateMemberStatus(member_id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, message: `Member ${status}` });
  } catch (error) {
    console.error("Error updating member status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
