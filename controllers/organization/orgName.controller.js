// Controller file
const { findOrgName,findOrgNameSecondary } = require("../../model/org.model");

exports.orgName = async (req, res) => {
  const user_Id = req.userId;

  try {
    const [orgNames] = await findOrgName(user_Id);

    if (orgNames.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No primary organization found for this user.",
      });
    }

    // Return first org name, or modify this to return all
    return res.status(200).json({
      success: true,
      orgName: orgNames,
    });
  } catch (error) {
    console.error("Server error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.orgNameSecondary = async (req, res) => {
  const {member_id} = req.body;

  try {
    const [orgNamesSecondary] = await findOrgNameSecondary(member_id);

    if (orgNamesSecondary.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medical found you work at.",
      });
    }


    return res.status(200).json({
      success: true,
      orgName: orgNamesSecondary,
    });
  } catch (error) {
    console.error("Server error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}