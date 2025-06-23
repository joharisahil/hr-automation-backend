const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");

const { organization } = require("../controllers/organization/org.controller");
const { orgSubscription } = require("../controllers/organization/subscription.controller");
const { invite } = require("../controllers/organization/invite.controller");
const { getPendingRequests } = require("../controllers/organization/getPendingRequests");
const { confirmMember } = require("../controllers/organization/confirmMember");
const { addMember } = require("../controllers/organization/addMember"); 



router.post("/organization", verifyToken , organization);

router.post("/org-subscription", verifyToken , orgSubscription);

router.post("/org-invite", verifyToken ,invite);       

router.post("/invite/:invite_token", verifyToken, addMember); 

router.post('/org/pending-requests', verifyToken , getPendingRequests);

router.patch('/org/member/:member_id/status', verifyToken , confirmMember);

module.exports = router;