const { insertInvite } = require('../../model/invite.model');
const { findOrgUserByUserId } = require('../../model/org.model');
const { findUserById } = require('../../model/user.model'); 
const{findInviteExpTime} = require('../../model/invite.model');
const { use } = require('react');

exports.addMember = async (req, res) => {
   //const { invite_token }=req.params;
    //console.log("Token:", invite_token);

  const { phone_no } = req.body;
  const userId = req.userId;

  try {
    // 1. Check if the user exists
    const [user] = await findUserById(userId);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Check if the user is part of any organization
    const [orgUserData] = await findOrgUserByUserId(userId);
    if (orgUserData.length === 0) {
      return res.status(404).json({ success: false, message: "User not found in any organization" });
    }

    // const expiredInvite = await findInviteExpTime(invite_token);

    // if (expiredInvite.length === 0) {
    //   return res.status(404).json({ success: false, message: "Invite token not found or expired" });
    // }

    // const now = new Date();
    // const presentTime = now.toISOString().slice(0, 19).replace('T', ' ');

    // console.log(presentTime); // '2025-06-15 09:43:20'

    // if( expiredInvite < presentTime) {
    //   return res.status(400).json({ success: false, message: "Invite token has expired" });
    // }

     
    const orgName= await findOrgUserByUserId(userId);
    if (orgName.length === 0) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    console.log("Organization Name:", orgName);


    
   


  } catch (error) {
    console.error("Error in addMember controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}