const { findUserById } = require("../../model/user.model");
const {
  getLatestSubscription,
  insertSubscription,
  expireSubscription,
} = require("../../model/org.model");
const { getPlanById } = require("../../model/plan.model"); // Moved plan query here
const { updateFSet } = require("../../model/org.model");  // For setting f_set = 1

exports.orgSubscription = async (req, res) => {
  const user_id = req.userId;
  const { plan_id } = req.body;

  try {
    const [user] = await findUserById(user_id);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found in any organization" });
    }

    const org_id = user[0].org_id;
    const org_user_id = user[0].id;
    const f_set = user[0].f_set;

    const [subscriptions] = await getLatestSubscription(org_user_id);

    // Expire current active subscription
    if (subscriptions.length > 0) {
      const latestSub = subscriptions[0];
      await expireSubscription(latestSub.subscription_id);

      if (plan_id === "f_001" && f_set === 1) {
        return res.status(403).json({ success: false, message: "Free access already used once" });
      }
    }

    // Use free plan
    if (!plan_id || plan_id === "f_001") {
      if (f_set === 1) {
        return res.status(403).json({ success: false, message: "Free access already used once" });
      }

      const [freePlan] = await getPlanById("f_001");
      if (freePlan.length === 0) {
        return res.status(404).json({ success: false, message: "Free plan not found" });
      }

      const plan_days = freePlan[0].plan_days;
      const start_date = new Date();
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + plan_days);

      await insertSubscription(org_user_id, org_id, "f_001", start_date, end_date, "active");
      await updateFSet(org_user_id); // uses model function

      return res.status(201).json({
        success: true,
        message: "Free access granted",
        data: { org_user_id, org_id, plan_id: "f_001", start_date, end_date, status: "active" },
      });
    }

    // Paid plan
    const [planResult] = await getPlanById(plan_id);
    if (planResult.length === 0) {
      return res.status(404).json({ success: false, message: "Selected plan not found" });
    }

    const plan_days = planResult[0].plan_days;
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + plan_days);

    await insertSubscription(org_user_id, org_id, plan_id, start_date, end_date, "active");

    return res.status(201).json({
      success: true,
      message: "Subscription activated",
      data: { org_user_id, org_id, plan_id, start_date, end_date, status: "active" },
    });
  } catch (error) {
    console.error("Error in orgSubscription:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
