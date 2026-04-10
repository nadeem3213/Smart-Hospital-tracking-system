const express = require("express");
const router = express.Router();
const { getHospitals, createHospital, updateHospital } = require("../controllers/hospitalController");
const { authenticateAdmin } = require("../middleware/auth");

router.route("/").get(getHospitals).post(createHospital);
router.route("/:id").put(authenticateAdmin, updateHospital);

module.exports = router;
