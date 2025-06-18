const db = require("../config/db");

exports.insertInvite = (org_id, phone_no, invite_token, expiresAt) =>
  db.query(
    "INSERT INTO org_invites (org_id, phone_no, invite_token, expiresAt) VALUES (?, ?, ?, ?)",
    [org_id,phone_no,invite_token, expiresAt]
  );

  exports.findInviteExpTime=(invite_token) =>
  db.query(
    "SELECT expiresAt FROM org_invites WHERE invite_token = ?",
    [invite_token],
  ).then(([rows]) => rows);
    
  exports.matchInviteToken = (phone_no) =>
  db.query(
    "SELECT * FROM org_invites WHERE phone_no = ? ORDER BY created_date DESC LIMIT 1",
    [phone_no]
  );


   exports.findOrgId=(invite_token) =>
    db.query(
      "SELECT org_id FROM org_invites WHERE invite_token = ?",
      [invite_token]
    );

    exports.updateInviteStatus = (token, status) => 
    db.query("UPDATE org_invites SET status = ? WHERE invite_token = ?", [status, token]);


  exports.findInviteByToken = (invite_token) =>
  db.query(
    "SELECT * FROM org_invites WHERE invite_token = ?",
    [invite_token]
  );

exports.insertMember = (memberData) =>
  db.query(
    `INSERT INTO org_members (
      leader_id,
      member_id,
      org_id,
      role,
      status,
      joined_date
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      memberData.leader_id,
      memberData.member_id,
      memberData.org_id,
      memberData.role,
      memberData.status,
      memberData.joined_date
    ]
  );

  exports.updateMemberStatus = (member_id, status) =>
  db.query(
    "UPDATE org_members SET status = ? WHERE member_id = ?",
    [status, member_id]
  );
  
  exports.findOrgUserId = (org_id) =>
  db.query(
    "SELECT org_user_id FROM org_subscription WHERE org_id = ?",
    [org_id]
  )

  exports.leaderId=(invite_token) =>
  db.query(
    `SELECT ou.user_id
     FROM org_invites AS oi
     JOIN org_user AS ou ON oi.org_id = ou.org_id
     WHERE oi.invite_token = ?`,
    [invite_token]
  )