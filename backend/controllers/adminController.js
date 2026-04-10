const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

function generateToken(adminId) {
  return jwt.sign({ id: adminId, role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: { id: admin._id, email: admin.email, role: "admin" },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getAllProfiles(req, res) {
  try {
    const profiles = await Profile.find().populate("userId", "name email createdAt").sort({ updatedAt: -1 });
    return res.status(200).json({ profiles });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getProfileById(req, res) {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId }).populate("userId", "name email createdAt");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { adminLogin, getAllProfiles, getProfileById };
