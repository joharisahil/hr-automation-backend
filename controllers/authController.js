const db = require("../config/db");
const { generateToken } = require("../utils/token");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup + Send OTP

exports.signuplog = async (req, res) => {
  console.log("signuplogin started");
  const { phone_no, name } = req.body;

  const [user] = await db.query("SELECT * FROM users WHERE phone_no = ?", [
    phone_no,
  ]);

  let userId,
    isNewUser = false;

  if (user.length > 0) {
    userId = user[0].user_id;
  } else {
    if (!name) return res.status(400).send("Name is required for new users");
    const result = await db.query(
      "INSERT INTO users (phone_no, name) VALUES (?, ?)",
      [phone_no, name]
    );
    userId = result[0].insertId;
    isNewUser = true;
  }

  // Generate OTP and save with `used` = 0
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60000);

  await db.query(
    "INSERT INTO otp (user_id, otp_code, expires_at, used, is_new_user) VALUES (?, ?, ?, 0, ?)",
    [userId, otp, expiresAt, isNewUser ? 1 : 0]
  );

  console.log(`OTP for ${phone_no}: ${otp}`);
  res.send("OTP sent. Please verify.");
  console.log("signuplogin ended");
};

// Verify OTP

exports.verifyOtp = async (req, res) => {
  console.log("verifyOtp started");
  const { phone_no, otp_code, firebase_token, device_token } = req.body;

  const [user] = await db.query("SELECT * FROM users WHERE phone_no = ?", [
    phone_no,
  ]);
  if (user.length === 0) return res.status(404).send("User not found");

  const userId = user[0].user_id;

  const [otpData] = await db.query(
    "SELECT * FROM otp WHERE user_id = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

  const otp = otpData[0];

  const now = new Date();

  const isExpired = !otp || new Date(otp.expires_at) < now;
  const isInvalid = otp.otp_code !== otp_code;

  if (!otp || isExpired || isInvalid) {
    // Delete OTP
    await db.query("DELETE FROM otp WHERE user_id = ?", [userId]);

    // If it's a new user and verification failed, delete the user
    if (otp && otp.is_new_user === 1) {
      await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
    }
    // If it's an existing user, update the firebase_token and device_token

    // if (otp && otp.is_new_user === 0) {
    //      //check firebase_token and device_token
    // if (user[0].firebase_token !== firebase_token || user[0].device_token !== device_token) {
    //   await db.query("UPDATE users SET firebase_token = ?, device_token = ? WHERE user_id = ?", [
    //     firebase_token,
    //     device_token,
    //     userId,
    //   ]);
    // }
    // }

    // await db.query(" update users set firebase_token = ?, device_token = ? where user_id = ?",[])

    return res.status(401).send("Invalid or expired OTP");
  }

  // updating firebase and device token
  await db.query(
    "UPDATE users SET firebase_token = ?, device_token = ? WHERE user_id = ?",
    [firebase_token, device_token, userId]
  );

  // Mark OTP as used
  await db.query("UPDATE otp SET used = 1 WHERE otp_id = ?", [otp.otp_id]);

  const { token, expiresAt } = generateToken(
    {
      user_id: user[0].user_id,
      phone_no: user[0].phone_no,
      name: user[0].name,
      firebase_token,
      device_token,
    },
    "3d"
  );

  await db.query(
    "INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  // res.cookie("token", token, {

  //   httpOnly: true,
  //   maxAge: 3600000,
  // });
// res mot working


  return res.status(201).json({
      success: true,
      message: "otp verified and logged in",
      data: {
       token
      },
    });
  console.log("verifyOtp ended");
};

// Logout

exports.logout = async (req, res) => {
  console.log("logout started");
  const token = req.cookies.token;
  if (token) {
    await db.query("DELETE FROM tokens WHERE token = ?", [token]);
    res.clearCookie("token");
  }
  res.send("Logged out");
  console.log("logout ended");
};

// Organization Entry
exports.organization = async (req, res) => {
  console.log("Organization entry started");

  const { org_name} = req.body;
  const user_id = req.userId;
  const role="primary"

  try {
    // 1. Check if user exists
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);
    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Insert into organization and get latest org_id via insertId
    const [orgResult] = await db.query(
      "INSERT INTO organization (org_name) VALUES (?)",
      [org_name]
    );
    const org_id = orgResult.insertId;

    // 3. Insert into org_user table
    await db.query(
      "INSERT INTO org_user (user_id, org_id, role) VALUES (?, ?, ? )",
      [user_id, org_id, role]
    );
    console.log("Organization entry ended");
    return res.status(201).json({
      success: true,
      message: "Organization and user role added",
      data: {
        org_id,
        org_name,
        user_id,
        role,
      },
    });
    
  } catch (error) {
    console.error("Error in organization:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Organization Subscription
exports.orgSubscription = async (req, res) => {
  console.log("orgSubscription started");
  const user_id = req.userId;
  const { plan_id } = req.body;

  try {
    let status = "active";

    // 1. Get user/org info
    const [user] = await db.query("SELECT * FROM org_user WHERE user_id = ?", [
      user_id,
    ]);
    
    if (user.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "User not found in any organization",
        });
    }

    const org_id = user[0].org_id;
    const id = user[0].org_user_id;

    // 2. Expire any active subscription
    const [existingSub] = await db.query(
      "SELECT * FROM org_subscription WHERE id = ? AND status = 'active'",
      [id]
    );

    if (existingSub.length > 0) {
      await db.query(
        "UPDATE org_subscription SET status = 'expired' WHERE subscription_id = ?",
        [existingSub[0].subscription_id]
      );
    }

    // 3. Get plan info
    const [planResult] = await db.query(
      "SELECT * FROM plans WHERE plan_id = ?",
      [plan_id]
    );
    if (planResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const plan_days = planResult[0].plan_days;

    // 4. Calculate dates
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + plan_days);

    if(start_date.getDate()<db.end_date.getDate()){
      status = "expired";
    }

    // 5. Insert new subscription
    await db.query(
      "INSERT INTO org_subscription (id, org_id, plan_id, end_date, status) VALUES (?, ?, ?, ?, ?)",
      [id, org_id, plan_id, end_date, status]
    );

    res.status(201).json({
      success: true,
      message: "Subscription updated successfully",
      data: {
        id,
        org_id,
        plan_id,
        start_date,
        end_date,
        status,
      },
    });
  } catch (error) {
    console.log("Error in orgSubscription", error);
    return res.status(500).json({ success: false, message: error.message });
  }

  console.log("orgSubscription ended");
};

// Check Auth
exports.checkAuth = async (req, res) => {
  try {
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      req.userId,
    ]);
    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: user[0] });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
