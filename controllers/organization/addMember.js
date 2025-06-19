const { findOrgUserByUserId, orgName } = require('../../model/org.model');
const { findUserById } = require('../../model/user.model'); 
const { findInviteExpTime, matchInviteToken, findOrgId, updateInviteStatus, findInviteByToken, insertMember, leaderId, findOrgUserId } = require('../../model/invite.model');

exports.addMember = async (req, res) => {
  const { invite_token } = req.params;
  console.log("Token:", invite_token);

  const phone_no = req.phone_no; // phone number from the request body
  const userId = req.userId; // here user id is of secondary user

  try {
    // 1. Check if the user exists
    const [user] = await findUserById(userId);
    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Check if invite exists and get expiry time
    const expiredInvite = await findInviteExpTime(invite_token);
    
    if (!expiredInvite || expiredInvite.length === 0) {
      return res.status(404).json({ success: false, message: "Invite token not found" });
    }

    // 3. Proper expiry time comparison
    const inviteExpiryTime = new Date(expiredInvite[0].expiresAt); 
    const currentTime = new Date();
    
    console.log("Current time:", currentTime);
    console.log("Invite expires at:", inviteExpiryTime);
    
    // Check if invite has expired
    if (currentTime > inviteExpiryTime) {
      await updateInviteStatus(invite_token, 'expired');
      return res.status(400).json({ success: false, message: "Invite token has expired" });
    }

    // 4. Match invite token with phone number
    console.log("Phone number:", phone_no);
    const [inviteToken] = await matchInviteToken(phone_no);
    
    if (!inviteToken || inviteToken.length === 0) {
      return res.status(404).json({ success: false, message: "No invite found for this phone number" });
    }
    
    console.log("Found invite token:", inviteToken[0].invite_token);
    
    // 5. Verify tokens match
    if (invite_token !== inviteToken[0].invite_token) {
      return res.status(400).json({ success: false, message: "Invalid invite token for this phone number" });
    }

    // 6. Get organization ID
    const [orgId] = await findOrgId(invite_token);
    
    if (!orgId || orgId.length === 0) {
      return res.status(404).json({ success: false, message: "Organization not found for this invite" });
    }
    
    console.log("Organization ID:", orgId[0].org_id);
    const org_id = orgId[0].org_id;

    // 7. Get organization name
    const [organizationName] = await orgName(org_id);
    
    if (!organizationName || organizationName.length === 0) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    
    console.log("Organization Name:", organizationName[0].org_name);

    // 8. Check if user is already a member of this organization
    const [existingMember] = await findOrgUserId(userId, org_id);
    if (existingMember && existingMember.length > 0) {
      return res.status(400).json({ success: false, message: "User is already a member of this organization" });
    }

    // 9. Update invite status to confirmed
    await updateInviteStatus(invite_token, 'confirmed');
    console.log("Invite status updated to confirmed");

    // 10. Get leader ID
    const [result] = await leaderId(invite_token);
    
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "Leader not found for this invite" });
    }
    
    const leader_id = result[0].user_id;
    console.log("Leader ID:", leader_id);

    // 11. Insert member
    await insertMember({
      leader_id: leader_id,
      member_id: userId,
      org_id: org_id,
      role: 'secondary',
      status: 'pending',
      joined_date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: {
        organization: organizationName[0].org_name,
        role: 'secondary',
        status: 'pending'
      }
    });

  } catch (error) {
    console.error("Error in addMember controller:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}