const {
  insertOrganization,
  insertOrgUser,
  findOrgUserByUserId,
} = require("../../model/org.model");
const { findUserById } = require("../../model/user.model");

exports.organization = async (req, res) => {
  const { org_name } = req.body;
  const user_id = req.userId;
  const role= "primary"; // default role for the user creating the organization

  try {
    // 1. Check if user exists
    const [userData] = await findUserById(user_id);
    if (userData.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Check if user already exists in org_user table
    const [orgUserData] = await findOrgUserByUserId(user_id);
    if (orgUserData.length > 0) {
      const userRole = orgUserData[0].role;

      if (userRole !== "primary") {
        return res.status(403).json({
          success: false,
          message: "Only users with 'primary' role can create an organization",
        });
      }

      
    }

    // 3. Create new organization
    const [orgResult] = await insertOrganization(org_name);
    const org_id = orgResult.insertId;

    // 4. Link user to organization as primary
    await insertOrgUser(user_id, org_id, role);

    res.status(201).json({
      success: true,
      message: "Organization created and user added as primary",
      data: { org_id, org_name, user_id, role: "primary" },
    });

  } catch (error) {
    console.error("Error in organization creation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
