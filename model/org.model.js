const db = require("../config/db");

exports.insertOrganization = (org_name) =>
  db.query("INSERT INTO organization (org_name) VALUES (?)", [org_name]);

exports.insertOrgUser = (user_id, org_id, role) =>
  db.query(
    "INSERT INTO org_user (user_id, org_id, role) VALUES (?, ?, ?)",
    [user_id, org_id, role]
  );

exports.findOrgUserByUserId = (user_id) =>
  db.query("SELECT * FROM org_user WHERE user_id = ?", [user_id]);

exports.updateFSet = (org_user_id) =>
  db.query("UPDATE org_user SET f_set = 1 WHERE id = ?", [org_user_id]);

exports.orgname=(org_id) =>
  db.query("SELECT org_name FROM organization WHERE org_id = ?", [org_id]);