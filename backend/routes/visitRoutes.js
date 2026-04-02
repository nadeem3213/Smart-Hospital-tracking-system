const express = require("express");
const { createVisit, getVisits, getUserVisits } = require("../controllers/visitController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, createVisit);
router.get("/", authenticateToken, getVisits);
router.get("/me", authenticateToken, getUserVisits);

module.exports = router;
