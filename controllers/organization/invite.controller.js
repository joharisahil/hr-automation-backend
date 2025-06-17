require('dotenv').config();
const crypto = require('crypto');
const { findUserById } = require('../../model/user.model');
const { findOrgUserByUserId } = require('../../model/org.model');  
const { insertInvite, insertLeader } = require('../../model/invite.model');
const {getSubscriptionById} = require('../../model/subscription.model');



exports.invite= async(req , res)=>{
    const {phone_no}= req.body;
    const userId= req.userId;
    try{
        const[user]= await findUserById(userId);
        if(user.length === 0){
            return res.status(404).json({success:false, message:"User not found"});
        }

        const[orgUserData] = await findOrgUserByUserId(userId);
            if(orgUserData.length === 0){
                return res.status(404).json({success:false, message:"User not found in any organization"});
            }
        
        const invite_token=crypto.randomBytes(20).toString("hex");
        const expiresAt= new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const inviteLink='${process.env.CLIENT_URL}/invite/${invite_token}';
        console.log(`Invite link: ${inviteLink}`);

        const org_user_id=getSubscriptionById(orgUserData[0].org_id);
        if(org_subs_id.length === 0){
            return res.status(404).json({success:false, message:"Organization subscription not found"});
        }

        insertInvite(orgUserData[0].org_id, phone_no, invite_token, expiresAt);

        // insertLeader(userId,orgUserData[0].org_id,org_user_id);
        
        
    }
    catch(error){
        console.error("Error in invite controller:", error);
        res.status(500).json({success:false, message:"Server error"});
    }
}