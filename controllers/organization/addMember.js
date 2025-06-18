
const { findOrgUserByUserId, orgName } = require('../../model/org.model');
const { findUserById } = require('../../model/user.model'); 
const{findInviteExpTime  ,matchInviteToken, findOrgId, updateInviteStatus, findInviteByToken, insertMember,leaderId, findOrgUserId } = require('../../model/invite.model');

exports.addMember = async (req, res) => {
   const { invite_token }=req.params;
   console.log("Token:", invite_token);

  const phone_no  = req.phone_no; // phone number from the request body

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
      
    await updateInviteStatus(invite_token, 'expired');
      return res.status(400).json({ success: false, message: "Invite token has expired" });
    }
console.log(phone_no);
const [inviteToken] = await matchInviteToken(phone_no);
    console.log("Invite Token:", inviteToken[0].invite_token);
    if (inviteToken.length === 0) {
      return res.status(404).json({ success: false, message: "Invite token not found" });
    }
if(invite_token!== inviteToken[0].invite_token) {
      return res.status(400).json({ success: false, message: "Invalid invite token" });
    }

console.log(phone_no);
console.log(inviteToken[0].invite_token);


    const [orgId] = await findOrgId(invite_token);

    console.log("Organization ID:", orgId[0].org_id);
    
   const  org_id = orgId[0].org_id; // Extracting org_id from the result

    const [organizationName]= await orgName(org_id);  

    console.log("Organization Name:", organizationName[0].org_name); 
     // finding org name from organization table
  
     if (organizationName.length === 0) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    console.log("Organization Name:", organizationName[0].org_name);

    await updateInviteStatus(invite_token, 'confirmed');
    console.log("Invite status updated to confirmed");  

      const [invite] = await findInviteByToken(invite_token);

      if (!invite || invite.length === 0) {
          return res.status(404).json({ success: false, message: "Invite not found" });
      }

      const [result] = await leaderId(invite_token)
   const  leader_id = result[0].user_id; // Extracting leader_id from the result'
   console.log("Leader ID:", leader_id);

  

await insertMember({
  leader_id: leader_id,
  member_id: userId,
  org_id: org_id, // Make sure this is the actual value, not undefined
  role: 'secondary',
  status: 'pending',
  joined_date: new Date(),
});
  
res.status(201).json({
 success: true,
   message: "Invitation generated successfully"
})

  } catch (error) {
    console.error("Error in addMember controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

