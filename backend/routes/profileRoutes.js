const express = require("express");
const { getProfile, saveProfile } = require("../controllers/profileController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getProfile);
router.post("/", authenticateToken, saveProfile);

module.exports = router;
