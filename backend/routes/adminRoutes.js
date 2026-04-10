const express = require("express");
const { adminLogin, getAllProfiles, getProfileById } = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/profiles", authenticateAdmin, getAllProfiles);
router.get("/profiles/:userId", authenticateAdmin, getProfileById);

module.exports = router;
