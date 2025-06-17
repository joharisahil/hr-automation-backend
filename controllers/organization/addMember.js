const { insertInvite } = require('../../model/invite.model');
const { findOrgUserByUserId, orgName } = require('../../model/org.model');
const { findUserById } = require('../../model/user.model'); 
const{findInviteExpTime  ,matchInviteToken, findOrgId, updateInviteStatus, findInviteByToken, insertMember } = require('../../model/invite.model');

exports.addMember = async (req, res) => {
   const { invite_token }=req.params;
   console.log("Token:", invite_token);

  const { phone_no } = req.body;
  const userId = req.userId;  // here user id is of secondary user

  try {
    // 1. Check if the user exists
    const [user] = await findUserById(userId);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const expiredInvite = await findInviteExpTime(invite_token);

    if (expiredInvite.length === 0) {
      return res.status(404).json({ success: false, message: "Invite token not found or expired" });
    }

    const now = new Date();
    const presentTime = now.toISOString().slice(0, 19).replace('T', ' ');

    console.log(presentTime); // '2025-06-15 09:43:20'

    if( expiredInvite < presentTime) {
      return res.status(400).json({ success: false, message: "Invite token has expired" });
    }

    const matchInvite=matchInviteToken(phone_no);
    if (matchInvite.length === 0) {
      return res.status(404).json({ success: false, message: "Invite token does not match with phone number" });
    }
    if (matchInvite !== invite_token) {
      return res.status(400).json({ success: false, message: "Invite token does not match" });
    }
     

    const orgId= findOrgId(invite_token);

    const organizationName=orgName(orgId);    // finding org name from organization table
    if (organizationName.length === 0) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    console.log("Organization Name:", organizationName[0].org_name);

    await updateInviteStatus(invite_token, 'confirmed');
      
      const [invite] = await findInviteByToken(invite_token);

      if (!invite || invite.length === 0) {
          return res.status(404).json({ success: false, message: "Invite not found" });
      }
      await insertMember({
  leader_id: invite.leader_id,
  member_id: userId,
  org_id,
  role: 'secondary',
  status: 'pending', // WAITING for leader approval
  joined_date: new Date(),
  org_user_id: invite.org_user_id,
});
   
  } catch (error) {
    console.error("Error in addMember controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

