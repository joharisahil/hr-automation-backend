const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");

// Auth controllers
const { checkAuth } = require("../controllers/auth/checkAuth.controller");
const { logout } = require("../controllers/auth/logout.controller");
const { verifyOtp } = require("../controllers/auth/otp.controller");
const { signuplog } = require("../controllers/auth/signupLogin.controller");

// Organization controllers
const { organization } = require("../controllers/organization/org.controller");
const { orgSubscription } = require("../controllers/organization/subscription.controller");
const { invite } = require("../controllers/organization/invite.controller");
const { getPendingRequests } = require("../controllers/organization/getPendingRequests");
const { confirmMember } = require("../controllers/organization/confirmMember");
 const { addMember } = require("../controllers/organization/addMember"); 


// Routes
router.get('/check-auth', verifyToken, checkAuth);

router.post("/signuplogin", signuplog);

router.post("/verify-otp", verifyOtp);

router.post("/logout", logout);

router.post("/organization", verifyToken , organization);

router.post("/org-subscription", verifyToken , orgSubscription);

router.post("/org-invite", verifyToken ,invite);       

router.post("/invite/:invite_token", verifyToken, addMember); 

router.post('/org/pending-requests', verifyToken , getPendingRequests);

router.patch('/org/member/:member_id/status', verifyToken , confirmMember);

// router.post("/org/confirm-member/:invite_token", verifyToken, confirmMember);

module.exports = router;
