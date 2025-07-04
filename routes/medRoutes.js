const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");
const { med } = require("../controllers/medicines/med.controller")
const {medDetails}= require("../controllers/medicines/med.controller")


router.post("/medicines", verifyToken , med)

router.get("/med-details", verifyToken , medDetails)

module.exports = router;