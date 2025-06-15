const db = require("../config/db");

exports.getLatestSubscription = (org_user_id) =>
  db.query(
    "SELECT * FROM org_subscription WHERE org_user_id = ? ORDER BY end_date DESC LIMIT 1",
    [org_user_id]
  );

exports.expireSubscription = (subscription_id) =>
  db.query(
    "UPDATE org_subscription SET status = 'expired' WHERE subscription_id = ?",
    [subscription_id]
  );

exports.insertSubscription = (
  org_user_id,
  org_id,
  plan_id,
  start_date,
  end_date,
  status
) =>
  db.query(
    "INSERT INTO org_subscription (org_user_id, org_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)",
    [org_user_id, org_id, plan_id, start_date, end_date, status]
  );

exports.getSubscriptionById = (org_id) =>(
  db.query(
  "SELECT org_user_id FROM org_subscription WHERE org_id= ?",
    [org_id]
  )
)
