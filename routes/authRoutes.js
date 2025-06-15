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

// Routes
router.get('/check-auth', verifyToken, checkAuth);

router.post("/signuplogin", signuplog);

router.post("/verify-otp", verifyOtp);

router.post("/logout", logout);

router.post("/organization", verifyToken, organization);

router.post("/org-subscription", verifyToken, orgSubscription);

router.post("/org-invite/:token",verifyToken,invite);

module.exports = router;
