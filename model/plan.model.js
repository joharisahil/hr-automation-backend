const db = require("../config/db");

exports.getPlanById = (plan_id) =>
  db.query("SELECT * FROM plans WHERE plan_id = ?", [plan_id]);
