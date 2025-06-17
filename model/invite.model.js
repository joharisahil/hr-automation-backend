const db = require("../config/db");

exports.insertInvite = (org_id, phone_no, invite_token, expiresAt) =>
  db.query(
    "INSERT INTO org_invites (org_id, phone_no, invite_token, expires_at) VALUES (?, ?, ?, ?)",
    [org_id,phone_no,invite_token, expiresAt]
  );

  exports.findInviteExpTime=(invite_token) =>
  db.query(
    "SELECT expiresAt FROM org_invites WHERE invite_token = ?",
    [invite_token]
  );

  // exports.insertLeader=(leader_id, org_id, org_user_id) =>
  //   db.query(
  //     "INSERT INTO org_leader (leader_id, org_id, org_user_id) VALUES (?, ?, ?)",
  //     [leader_id, org_id, org_user_id]
  //   );
    
    exports.matchInviteToken=(phone_no) =>
    db.query(
      "SELECT invite_token FROM org_invites WHERE phone_no = ?",
      [phone_no]
    );

   exports.findOrgId=(invite_token) =>
    db.query(
      "SELECT org_id FROM org_invites WHERE invite_token = ?",
      [invite_token]
    );

    exports.updateInviteStatus = async (token, status) => {
  return await db.query(`
    UPDATE org_invites SET status = ? WHERE invite_token = ?
  `, [status, token]);
};

  exports.findInviteByToken = (invite_token) =>
  db.query(
    "SELECT * FROM org_invites WHERE invite_token = ?",
    [invite_token]
  );

exports.insertMember =  (
  leader_id, member_id,org_id,role, status,joined_date,org_user_id) => 
 db.query(`
    INSERT INTO org_members (
      leader_id,
      member_id,
      org_id,
      role,
      status,
      joined_date,
      org_user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [leader_id, member_id, org_id, role, status, joined_date, org_user_id]);

  exports.updateMemberStatus = (member_id, status) =>
  db.query(
    "UPDATE org_members SET status = ? WHERE member_id = ?",
    [status, member_id]
  );
  