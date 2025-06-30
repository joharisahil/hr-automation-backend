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

exports.orgName=(org_id) =>
  db.query("SELECT org_name FROM organization WHERE org_id = ?", [org_id]);

exports.findOrgName = (user_id) => 
 db.query("SELECT o.org_name FROM org_user ou JOIN organization o ON ou.org_id = o.org_id WHERE ou.user_id = ? AND ou.role = 'primary'",[user_id])

exports.findOrgNameSecondary= (member_id)=>
  db.query("select o.org_name from organization o join org_members om on om.org_id=o.org_id where om.member_id=? and om.role='secondary'",[member_id]);

exports.findMembersName= (org_id)=>
  db.query("SELECT u.name from users u join org_members om on u.user_id=om.member_id where om.org_id=?",[org_id]);