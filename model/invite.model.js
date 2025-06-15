const db = require("../config/db");

exports.insertInvite = (org_id, phone_no, invite_token, expiresAt) =>
  db.query(
    "INSERT INTO org_invites (org_id, phone_no, invite_token, expires_at) VALUES (?, ?, ?, ?)",
    [org_id,phone_no,invite_token, expiresAt]
  );

  exporrts.findInviteExpTime=(invite_token) =>
  db.query(
    "SELECT expiresAt FROM org_invites WHERE invite_token = ?",
    [invite_token]
  );

  exports.insertLeader=(leader_id, org_id, org_user_id) =>
    db.query(
      "INSERT INTO org_leader (leader_id, org_id, org_user_id) VALUES (?, ?, ?)",
      [leader_id, org_id, org_user_id]
    );
    