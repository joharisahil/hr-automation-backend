const {findMembersName}= require("../../model/org.model");

exports.membersName= async(req,res)=>{
  const {org_id} = req.body;

  try {
    const [membersNames] = await findMembersName(org_id);

    if (membersNames.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No member found.",
      });
    }


    return res.status(200).json({
      success: true,
      membersName: membersNames,
    });
  } catch (error) {
    console.error("Server error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};