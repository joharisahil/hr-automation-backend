const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");

const { organization } = require("../controllers/organization/org.controller");
const { orgSubscription } = require("../controllers/organization/subscription.controller");
const { invite } = require("../controllers/organization/invite.controller");
const { getPendingRequests } = require("../controllers/organization/getPendingRequests");
const { confirmMember } = require("../controllers/organization/confirmMember");
const { addMember } = require("../controllers/organization/addMember"); 
const { orgName,orgNameSecondary }= require("../controllers/organization/orgName.controller");
const { membersName }= require ("../controllers/organization/membersName")



router.post("/organization", verifyToken , organization);

router.post("/org-subscription", verifyToken , orgSubscription);

router.post("/org-invite", verifyToken ,invite);       

router.post("/invite/:invite_token", verifyToken, addMember); 

router.post('/org/pending-requests', verifyToken , getPendingRequests);

router.patch('/org/member/:member_id/status', verifyToken , confirmMember);

router.get("/org-name", verifyToken, orgName)

router.get("/members-name", verifyToken, membersName )

router.get("/org-name-sec", verifyToken, orgNameSecondary);

module.exports = router;